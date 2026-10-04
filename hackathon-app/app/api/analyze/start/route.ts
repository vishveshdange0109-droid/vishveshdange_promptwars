import { NextRequest, NextResponse } from "next/server";
import { validateInputLayer1 } from "@/lib/decision/rules";
import { runSituationAnalyzer } from "@/lib/ai/grok";
import { createSession, saveSituation } from "@/lib/db";
import { createInitialDecisionState } from "@/lib/decision/state";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawDecision = body.decision;

    // Layer 1: Deterministic checks
    const l1 = validateInputLayer1(rawDecision);
    if (!l1.valid) {
      return NextResponse.json(
        { status: "ERROR", message: l1.error },
        { status: 400 }
      );
    }

    // Layer 2: Situation Analyzer
    const analysis = await runSituationAnalyzer(rawDecision);

    if (!analysis.isDecision) {
      return NextResponse.json({
        status: "NOT_A_DECISION",
        message:
          "Think Twice is for examining a decision you're facing. Describe one to begin.",
      });
    }

    if (analysis.clarificationNeeded) {
      return NextResponse.json({
        status: "NEEDS_CLARIFICATION",
        question:
          analysis.clarifyingQuestion ||
          "What specific options or distinct paths are you weighing in this situation?",
      });
    }

    // Valid decision: create session & situation record
    const session = await createSession();
    const initialState = createInitialDecisionState(
      analysis.decisionStatement,
      analysis.statedGoal,
      []
    );

    const situation = await saveSituation({
      session_id: session.id,
      raw_input: rawDecision,
      decision_statement: analysis.decisionStatement,
      domain: analysis.domain,
      options: analysis.options,
      key_entities: analysis.keyEntities,
      in_scope_topics: analysis.inScopeTopics,
      confirmed: false,
      decision_state: initialState,
    });

    return NextResponse.json({
      status: "NEEDS_CONFIRMATION",
      sessionId: session.id,
      situation: {
        id: situation.id,
        decisionStatement: analysis.decisionStatement,
        domain: analysis.domain,
        options: analysis.options,
        statedGoal: analysis.statedGoal,
        keyEntities: analysis.keyEntities,
        inScopeTopics: analysis.inScopeTopics,
        missingContext: analysis.missingContext,
      },
    });
  } catch (err: unknown) {
    console.error("Error in /api/analyze/start:", err);
    return NextResponse.json(
      {
        status: "ERROR",
        message: "An unexpected error occurred while analyzing your decision.",
      },
      { status: 500 }
    );
  }
}
