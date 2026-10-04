import { z } from "zod";

export const QuestionCategoryEnum = z.enum([
  "FACT",
  "MOTIVATION",
  "ASSUMPTION",
  "EVIDENCE",
  "CONSEQUENCE",
  "SECOND_ORDER",
  "TRADEOFF",
  "OPPORTUNITY_COST",
  "RISK",
  "REVERSIBILITY",
  "EMOTION",
  "UNKNOWN",
]);

export type QuestionCategory = z.infer<typeof QuestionCategoryEnum>;

export const AllowedActionEnum = z.enum([
  "ASK_QUESTION",
  "REQUEST_EVIDENCE",
  "REFLECT",
  "FINISH",
]);

export type AllowedAction = z.infer<typeof AllowedActionEnum>;

export const ScopeLabelEnum = z.enum([
  "ANSWER",
  "NEW_RELEVANT_INFO",
  "OFF_TOPIC",
]);

export type ScopeLabel = z.infer<typeof ScopeLabelEnum>;

// Section 4.2: Situation Analyzer Schema
export const SituationAnalyzerSchema = z.object({
  isDecision: z.boolean(),
  clarificationNeeded: z.boolean(),
  clarifyingQuestion: z.string().nullable().optional(),
  decisionStatement: z.string(),
  domain: z.string().default("general"),
  options: z.array(z.string()).default([]),
  stakeholders: z.array(z.string()).default(["self"]),
  keyEntities: z.array(z.string()).default([]),
  statedGoal: z.string().default("Make an informed choice"),
  inScopeTopics: z.array(z.string()).default([]),
  missingContext: z.array(z.string()).default([]),
});

export type SituationAnalysis = z.infer<typeof SituationAnalyzerSchema>;

// Section 6.2: Combined Turn Response Schema
export const TurnResponseSchema = z.object({
  scope: ScopeLabelEnum,
  action: AllowedActionEnum.default("ASK_QUESTION"),
  question: z.string().nullable().optional(),
  reflection: z.string().nullable().optional(),
  category: QuestionCategoryEnum.default("ASSUMPTION"),
  reason: z.string().nullable().optional(),
  needsEvidence: z.boolean().default(false),
  evidenceQuery: z.string().nullable().optional(),
  stateUpdate: z
    .object({
      knownFacts: z.array(z.string()).default([]),
      assumptions: z.array(z.string()).default([]),
      risks: z.array(z.string()).default([]),
      unknowns: z.array(z.string()).default([]),
      exploredDimensions: z.array(z.string()).default([]),
    })
    .default({
      knownFacts: [],
      assumptions: [],
      risks: [],
      unknowns: [],
      exploredDimensions: [],
    }),
});

export type TurnResponse = z.infer<typeof TurnResponseSchema>;

// Section 11: Decision Landscape Schema
export const DecisionLandscapeSchema = z.object({
  decision: z.string(),
  whatWeKnow: z.array(z.string()),
  assumptions: z.array(z.string()),
  evidence: z.array(z.string()),
  consequences: z.array(z.string()),
  secondOrderEffects: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  opportunityCosts: z.array(z.string()),
  risks: z.array(z.string()),
  unknowns: z.array(z.string()),
  scenarios: z.object({
    bestCase: z.string(),
    worstCase: z.string(),
    plausibleCase: z.string(),
  }),
  criticalQuestion: z.string(),
  closingLine: z
    .string()
    .default(
      "You still make the decision. Think Twice doesn't tell you what to do. It makes sure you know what you're actually deciding."
    ),
});

export type DecisionLandscape = z.infer<typeof DecisionLandscapeSchema>;
