import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  getSituationBySessionId,
  updateSituation,
  updateSession,
  addMessage,
} from "@/lib/db";
import { runTurnInterrogation } from "@/lib/ai/grok";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, confirmed, editedStatement } = body;

    if (!sessionId) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing sessionId" },
        { status: 400 }
      );
    }

    const session = await getSession(sessionId);
    const situation = await getSituationBySessionId(sessionId);

    if (!session || !situation) {
      return NextResponse.json(
        { status: "ERROR", message: "Session or situation not found" },
        { status: 404 }
      );
    }

    // Update statement if user edited during confirmation
    const finalStatement =
      typeof editedStatement === "string" && editedStatement.trim()
        ? editedStatement.trim()
        : situation.decision_statement;

    const updatedState = {
      ...situation.decision_state,
      decision: finalStatement,
    };

    await updateSituation(sessionId, {
      decision_statement: finalStatement,
      confirmed: true,
      decision_state: updatedState,
    });

    await updateSession(sessionId, {
      question_count: 1,
    });

    // Formulate the opening question
    const firstTurn = await runTurnInterrogation(
      {
        decision_statement: finalStatement,
        domain: situation.domain,
        options: situation.options,
        key_entities: situation.key_entities,
        in_scope_topics: situation.in_scope_topics,
        raw_input: situation.raw_input,
      },
      updatedState,
      [],
      "I am ready to examine this decision.",
      0
    );

    const firstQuestion =
      firstTurn.question ||
      "What is the single most pressing reason driving you toward making this choice right now?";

    // Save opening question as assistant message
    await addMessage(sessionId, "assistant", firstQuestion, null);

    return NextResponse.json({
      action: "ASK_QUESTION",
      question: firstQuestion,
      category: firstTurn.category || "MOTIVATION",
      perspectivesExplored: updatedState.exploredDimensions.length || 1,
      questionCount: 1,
    });
  } catch (err: unknown) {
    console.error("Error in /api/analyze/confirm:", err);
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Failed to confirm decision situation.",
      },
      { status: 500 }
    );
  }
}
