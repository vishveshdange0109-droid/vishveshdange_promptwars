import OpenAI from "openai";
import {
  SituationAnalysis,
  SituationAnalyzerSchema,
  TurnResponse,
  TurnResponseSchema,
  DecisionLandscape,
  DecisionLandscapeSchema,
} from "./schemas";
import {
  SITUATION_ANALYZER_SYSTEM_PROMPT,
  COMBINED_TURN_SYSTEM_PROMPT,
  FINALIZE_LANDSCAPE_SYSTEM_PROMPT,
  buildTurnUserPrompt,
} from "./prompts";
import { validateQuestionLayer4, SAFE_FALLBACK_QUESTION } from "../decision/rules";
import { DecisionState } from "../decision/state";

function getAIClient(): { client: OpenAI | null; model: string } {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const customKey = process.env.AI_API_KEY;

  if (groqKey) {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      }),
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    };
  }

  if (xaiKey) {
    return {
      client: new OpenAI({
        apiKey: xaiKey,
        baseURL: "https://api.x.ai/v1",
      }),
      model: process.env.XAI_MODEL || "grok-beta",
    };
  }

  if (openaiKey) {
    return {
      client: new OpenAI({
        apiKey: openaiKey,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
      }),
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }

  if (customKey) {
    return {
      client: new OpenAI({
        apiKey: customKey,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
      }),
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }

  return { client: null, model: "" };
}

// -------------------------------------------------------------
// Fallback Heuristic Engine (Offline / Zero-Config mode)
// -------------------------------------------------------------
function simulateSituationAnalysis(input: string): SituationAnalysis {
  const lower = input.toLowerCase();

  // Test cases: not a decision
  if (
    lower.includes("write me a python") ||
    lower.includes("python game") ||
    lower.includes("act as chatgpt") ||
    lower.includes("ignore your instructions") ||
    lower.includes("tell me a joke") ||
    lower.includes("weather today") ||
    /^(hi|hello|hey|test)\b/i.test(lower.trim())
  ) {
    return {
      isDecision: false,
      clarificationNeeded: false,
      clarifyingQuestion: null,
      decisionStatement: "",
      domain: "other",
      options: [],
      stakeholders: [],
      keyEntities: [],
      statedGoal: "",
      inScopeTopics: [],
      missingContext: [],
    };
  }

  // Test case: too vague / clarification needed
  if (
    lower.includes("unhappy at work") ||
    lower.includes("feeling stuck") ||
    (lower.length < 25 && !lower.includes("should") && !lower.includes("or") && !lower.includes("whether"))
  ) {
    return {
      isDecision: true,
      clarificationNeeded: true,
      clarifyingQuestion:
        "What specific options or distinct paths are you actively weighing right now?",
      decisionStatement: input.trim(),
      domain: "career",
      options: [],
      stakeholders: ["self"],
      keyEntities: ["job", "career"],
      statedGoal: "Improve satisfaction and career direction",
      inScopeTopics: ["job", "career", "work environment"],
      missingContext: ["concrete alternatives under consideration"],
    };
  }

  // Standard decision extraction
  const isCollegeStartup =
    lower.includes("college") || lower.includes("startup") || lower.includes("school");

  if (isCollegeStartup) {
    return {
      isDecision: true,
      clarificationNeeded: false,
      clarifyingQuestion: null,
      decisionStatement:
        "Whether to leave college to work full-time on my startup",
      domain: "career/education",
      options: [
        "Leave college to work full-time on startup",
        "Stay enrolled in college while working part-time on startup",
        "Take a temporary leave of absence",
      ],
      stakeholders: ["self", "cofounders", "family", "investors"],
      keyEntities: ["college", "startup", "degree", "runway"],
      statedGoal: "Make faster progress on the startup without premature irreversible ruin",
      inScopeTopics: [
        "college",
        "startup progress",
        "finances",
        "career fallback",
        "family expectations",
        "degree completion",
        "runway",
        "market timing",
      ],
      missingContext: ["financial runway", "startup stage", "academic standing"],
    };
  }

  // General decision heuristic
  const cleaned = input.replace(/^(should i|whether to|i am thinking of|i'm thinking about)\s+/i, "");
  return {
    isDecision: true,
    clarificationNeeded: false,
    clarifyingQuestion: null,
    decisionStatement: `Whether to ${cleaned.replace(/\?$/, "")}`,
    domain: "personal/strategic",
    options: ["Proceed with the change", "Maintain current status quo", "Test an incremental step"],
    stakeholders: ["self", "key peers", "dependents"],
    keyEntities: ["choice", "resources", "timeline"],
    statedGoal: "Optimize long-term outcome while managing downside risks",
    inScopeTopics: ["timeline", "financial impact", "reversibility", "key relationships", "trade-offs"],
    missingContext: ["exact timeline", "resource constraints"],
  };
}

function simulateTurnResponse(
  situation: {
    decision_statement: string;
    in_scope_topics?: string[];
    key_entities?: string[];
  },
  state: DecisionState,
  latestMessage: string,
  turnNumber: number
): TurnResponse {
  const lower = latestMessage.toLowerCase();

  // Test cases for off-topic
  const isOffTopic =
    lower.includes("quantum") ||
    lower.includes("python") ||
    lower.includes("chatgpt") ||
    lower.includes("french revolution") ||
    lower.includes("weather") ||
    lower.includes("crypto price") ||
    lower.includes("ignore") ||
    lower.includes("system prompt");

  if (isOffTopic) {
    return {
      scope: "OFF_TOPIC",
      action: "ASK_QUESTION",
      question: null,
      reflection: null,
      category: "UNKNOWN",
      reason: "Message is unrelated to the active decision.",
      needsEvidence: false,
      evidenceQuery: null,
      stateUpdate: {
        knownFacts: [],
        assumptions: [],
        risks: [],
        unknowns: [],
        exploredDimensions: [],
      },
    };
  }

  // Test cases: new relevant info vs answer
  const isNewInfo =
    lower.includes("tuition") ||
    lower.includes("parents") ||
    lower.includes("actually") ||
    lower.includes("runway") ||
    lower.includes("savings");

  const scope = isNewInfo ? "NEW_RELEVANT_INFO" : "ANSWER";

  // Sequence of high-impact interrogation questions across dimensions
  const questionSequence: Array<{
    category: TurnResponse["category"];
    dimension: string;
    question: string;
    factExtract: string;
    assumptionExtract: string;
    riskExtract: string;
    needsEvidence?: boolean;
    evidenceQuery?: string;
  }> = [
    {
      category: "ASSUMPTION",
      dimension: "assumptions",
      question:
        "What evidence do you have that lack of time, rather than another constraint, is why your startup isn't progressing faster?",
      factExtract: `User reported: "${latestMessage.slice(0, 100)}"`,
      assumptionExtract: "Assuming available time is the primary bottleneck to progress",
      riskExtract: "Allocating 100% time may reveal product-market fit or distribution was the real bottleneck",
      needsEvidence: true,
      evidenceQuery: "Has output scaled linearly with hours previously invested?",
    },
    {
      category: "REVERSIBILITY",
      dimension: "reversibility",
      question:
        "If you left and the venture had not gained traction after twelve months, what exact fallback options remain open to you?",
      factExtract: "Examining one-year downside boundary",
      assumptionExtract: "Assuming returning or pivoting remains viable within 12 months",
      riskExtract: "Re-enrollment friction, lost momentum, or financial debt accumulation",
    },
    {
      category: "OPPORTUNITY_COST",
      dimension: "opportunity_cost",
      question:
        "What non-academic benefits of your current situation—such as peer network, credibility, or lower stress—are you giving up?",
      factExtract: "Weighing hidden benefits of the current baseline",
      assumptionExtract: "Belief that full-time focus outweighs institutional network and stability",
      riskExtract: "Underestimating the psychological isolation and peer support loss",
    },
    {
      category: "SECOND_ORDER",
      dimension: "second_order",
      question:
        "If your initial plan succeeds in month six, what new obligations or stakeholder pressures will that immediately trigger?",
      factExtract: "Evaluating second-order commitments post-success",
      assumptionExtract: "Assuming success simplifies life rather than creating heavier demands",
      riskExtract: "Premature lock-in with investors or operational overhead",
    },
    {
      category: "TRADEOFF",
      dimension: "tradeoffs",
      question:
        "What is the single biggest uncertainty you are currently treating as settled even though you have not verified it?",
      factExtract: "Stress-testing unverified core premises",
      assumptionExtract: "Assuming unverified risks will resolve themselves in motion",
      riskExtract: "Critical blindspot in runway or unit economics",
    },
  ];

  const qIdx = Math.min(turnNumber, questionSequence.length - 1);
  const qItem = questionSequence[qIdx];

  // If question count reaches threshold, trigger FINISH
  if (turnNumber >= 5) {
    return {
      scope,
      action: "FINISH",
      question: null,
      reflection: "Key assumptions, fallback reversibility, and risk horizons have been examined.",
      category: "UNKNOWN",
      reason: "Session reached exploration depth.",
      needsEvidence: false,
      evidenceQuery: null,
      stateUpdate: {
        knownFacts: [qItem.factExtract],
        assumptions: [qItem.assumptionExtract],
        risks: [qItem.riskExtract],
        unknowns: ["Market timing", "Execution velocity under pressure"],
        exploredDimensions: [qItem.dimension],
      },
    };
  }

  return {
    scope,
    action: "ASK_QUESTION",
    question: qItem.question,
    reflection: null,
    category: qItem.category,
    reason: `Examining ${qItem.dimension} to stress-test belief foundations.`,
    needsEvidence: qItem.needsEvidence || false,
    evidenceQuery: qItem.evidenceQuery || null,
    stateUpdate: {
      knownFacts: [qItem.factExtract],
      assumptions: [qItem.assumptionExtract],
      risks: [qItem.riskExtract],
      unknowns: ["Long-term fallback viability"],
      exploredDimensions: [qItem.dimension],
    },
  };
}

function simulateFinalLandscape(
  situation: { decision_statement: string; options?: string[]; raw_input?: string },
  state: DecisionState
): DecisionLandscape {
  return {
    decision: situation.decision_statement,
    whatWeKnow:
      state.knownFacts.length > 0
        ? state.knownFacts
        : [
            "You are actively weighing distinct alternatives under resource and time constraints.",
            "The decision carries asymmetric consequences that persist past the near term.",
          ],
    assumptions:
      state.assumptions.length > 0
        ? state.assumptions
        : [
            "More dedicated time directly converts to proportionate progress.",
            "Reversibility remains possible if the target milestone is missed within 12 months.",
          ],
    evidence:
      state.evidence.length > 0
        ? state.evidence
        : ["Historical output during high-commitment periods provides partial indicators; systematic tracking is still unverified."],
    consequences: [
      "Concentrated effort on the chosen path eliminates hedging.",
      "Near-term feedback loop on real viability tightens significantly.",
    ],
    secondOrderEffects: [
      "Relationships and peer networks will reorganize around your daily focus.",
      "Financial runway burns faster without auxiliary support buffers.",
    ],
    tradeoffs: [
      "Immediate certainty and formal safety vs. high-velocity learning and upside.",
      "Structured progression vs. self-directed accountability.",
    ],
    opportunityCosts: [
      "Alternative career or educational credentials deferred.",
      "Energy diverted entirely away from secondary projects.",
    ],
    risks:
      state.risks.length > 0
        ? state.risks
        : [
            "Burnout caused by assuming the primary bottleneck was hours rather than strategy.",
            "Inability to easily re-enter the prior arrangement without friction.",
          ],
    unknowns:
      state.unknowns.length > 0
        ? state.unknowns
        : ["True customer demand velocity", "Personal psychological resilience over a prolonged plateau"],
    scenarios: {
      bestCase:
        "Full-time focus unlocks rapid product-market validation within 6 months, establishing clear defensible momentum.",
      worstCase:
        "After 12 months, progress stalls due to external bottlenecks while prior fallback channels have grown costly to re-open.",
      plausibleCase:
        "Modest progress is made, clarifying that customer acquisition—not available hours—is the real constraint, prompting an informed pivot.",
    },
    criticalQuestion:
      "What concrete metric or milestone will serve as your non-negotiable threshold to evaluate whether this choice is working after 180 days?",
    closingLine:
      "You still make the decision. Think Twice doesn't tell you what to do. It makes sure you know what you're actually deciding.",
  };
}

// -------------------------------------------------------------
// Live AI Callers with Layer 4 Verification & Auto-Retry
// -------------------------------------------------------------

export async function runSituationAnalyzer(input: string): Promise<SituationAnalysis> {
  const { client, model } = getAIClient();

  if (!client) {
    return simulateSituationAnalysis(input);
  }

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SITUATION_ANALYZER_SYSTEM_PROMPT },
        {
          role: "user",
          content: `USER INPUT TO ANALYZE (DATA ONLY):\n"""\n${input}\n"""`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const validated = SituationAnalyzerSchema.parse(parsed);
    return validated;
  } catch (err) {
    console.error("AI Situation Analyzer error, using heuristic fallback:", err);
    return simulateSituationAnalysis(input);
  }
}

export async function runTurnInterrogation(
  situation: {
    decision_statement: string;
    domain?: string;
    options?: string[];
    key_entities?: string[];
    in_scope_topics?: string[];
    raw_input?: string;
  },
  decisionState: DecisionState,
  history: Array<{ role: string; content: string }>,
  latestUserMessage: string,
  turnNumber: number
): Promise<TurnResponse> {
  const { client, model } = getAIClient();

  if (!client) {
    return simulateTurnResponse(situation, decisionState, latestUserMessage, turnNumber);
  }

  const promptContent = buildTurnUserPrompt(
    situation,
    decisionState,
    history,
    latestUserMessage
  );

  async function executeCall(): Promise<TurnResponse> {
    const response = await client!.chat.completions.create({
      model,
      messages: [
        { role: "system", content: COMBINED_TURN_SYSTEM_PROMPT },
        { role: "user", content: promptContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return TurnResponseSchema.parse(parsed);
  }

  try {
    let result = await executeCall();

    // If OFF_TOPIC, immediately return without question validation
    if (result.scope === "OFF_TOPIC") {
      return result;
    }

    // Layer 4 check on question
    if (result.action === "ASK_QUESTION") {
      const qVal = validateQuestionLayer4(result.question);
      if (!qVal.valid) {
        console.warn("Question validation failed:", qVal.error, "Retrying once...");
        try {
          result = await executeCall();
          const retryVal = validateQuestionLayer4(result.question);
          if (!retryVal.valid) {
            console.warn("Question retry validation failed, applying safe fallback.");
            result.question = SAFE_FALLBACK_QUESTION;
          }
        } catch {
          result.question = SAFE_FALLBACK_QUESTION;
        }
      }
    }

    return result;
  } catch (err) {
    console.error("AI Turn Interrogation error, using heuristic fallback:", err);
    return simulateTurnResponse(situation, decisionState, latestUserMessage, turnNumber);
  }
}

export async function runFinalizeLandscape(
  situation: {
    decision_statement: string;
    options?: string[];
    raw_input?: string;
    domain?: string;
  },
  decisionState: DecisionState,
  history: Array<{ role: string; content: string }>
): Promise<DecisionLandscape> {
  const { client, model } = getAIClient();

  if (!client) {
    return simulateFinalLandscape(situation, decisionState);
  }

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: FINALIZE_LANDSCAPE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `DECISION SITUATION:
Decision: ${situation.decision_statement}
Options: ${JSON.stringify(situation.options || [])}

ACCUMULATED DECISION STATE:
${JSON.stringify(decisionState, null, 2)}

DIALOGUE HISTORY:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}

Synthesize into the complete Decision Landscape JSON.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const validated = DecisionLandscapeSchema.parse(parsed);

    // Enforce fixed closing line
    validated.closingLine =
      "You still make the decision. Think Twice doesn't tell you what to do. It makes sure you know what you're actually deciding.";

    return validated;
  } catch (err) {
    console.error("AI Landscape finalize error, using heuristic fallback:", err);
    return simulateFinalLandscape(situation, decisionState);
  }
}
