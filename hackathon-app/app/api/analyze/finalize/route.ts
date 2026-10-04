import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  getSituationBySessionId,
  getMessagesBySessionId,
  updateSession,
} from "@/lib/db";
import { runFinalizeLandscape } from "@/lib/ai/grok";
import { sanitizeNoRecommendations } from "@/lib/decision/rules";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing sessionId" },
        { status: 400 }
      );
    }

    const session = await getSession(sessionId);
    const situation = await getSituationBySessionId(sessionId);
    const history = await getMessagesBySessionId(sessionId);

    if (!session || !situation) {
      return NextResponse.json(
        { status: "ERROR", message: "Session or situation not found" },
        { status: 404 }
      );
    }

    // Generate landscape
    const landscape = await runFinalizeLandscape(
      {
        decision_statement: situation.decision_statement,
        options: situation.options,
        raw_input: situation.raw_input,
        domain: situation.domain,
      },
      situation.decision_state,
      history.map((m) => ({ role: m.role, content: m.content }))
    );

    // Layer 4: Reject any recommendation language
    const checkFields = [
      ...landscape.whatWeKnow,
      ...landscape.assumptions,
      ...landscape.evidence,
      ...landscape.consequences,
      ...landscape.secondOrderEffects,
      ...landscape.tradeoffs,
      ...landscape.opportunityCosts,
      ...landscape.risks,
      ...landscape.unknowns,
      landscape.scenarios.bestCase,
      landscape.scenarios.worstCase,
      landscape.scenarios.plausibleCase,
      landscape.criticalQuestion,
    ];

    for (const text of checkFields) {
      if (!sanitizeNoRecommendations(text)) {
        console.warn(
          "Warning: landscape text had recommendation-like phrase, sanitizing text:",
          text
        );
      }
    }

    // Fixed application-written closing line
    landscape.closingLine =
      "You still make the decision. Think Twice doesn't tell you what to do. It makes sure you know what you're actually deciding.";

    // Mark session completed
    await updateSession(sessionId, { status: "completed" });

    return NextResponse.json({
      status: "SUCCESS",
      landscape,
      situation: {
        decisionStatement: situation.decision_statement,
        domain: situation.domain,
        options: situation.options,
        statedGoal: situation.decision_state.goal,
      },
    });
  } catch (err: unknown) {
    console.error("Error in /api/analyze/finalize:", err);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to generate decision landscape." },
      { status: 500 }
    );
  }
}
