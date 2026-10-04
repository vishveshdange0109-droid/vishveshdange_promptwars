import { NextRequest, NextResponse } from "next/server";
import { validateInputLayer1, validateQuestionLayer4, SAFE_FALLBACK_QUESTION } from "@/lib/decision/rules";
import {
  getSession,
  getSituationBySessionId,
  getMessagesBySessionId,
  updateSession,
  updateSituation,
  addMessage,
} from "@/lib/db";
import { runTurnInterrogation } from "@/lib/ai/grok";
import { buildReminder } from "@/lib/decision/reminder";
import { mergeDecisionState } from "@/lib/decision/state";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, message } = body;

    // Layer 1: Input length and existence
    const l1 = validateInputLayer1(message);
    if (!l1.valid) {
      return NextResponse.json(
        { status: "ERROR", message: l1.error },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing sessionId." },
        { status: 400 }
      );
    }

    // Load session & situation from DB
    const session = await getSession(sessionId);
    const situation = await getSituationBySessionId(sessionId);

    if (!session || !situation) {
      return NextResponse.json(
        { status: "ERROR", message: "Session or situation record not found." },
        { status: 404 }
      );
    }

    if (session.status !== "active") {
      return NextResponse.json(
        { status: "ERROR", message: "Session is already completed." },
        { status: 400 }
      );
    }

    // Retrieve conversation history
    const history = await getMessagesBySessionId(sessionId);

    // Identify last open assistant question to replay if off-topic
    const assistantMsgs = history.filter((m) => m.role === "assistant");
    const lastQuestion =
      assistantMsgs.length > 0
        ? assistantMsgs[assistantMsgs.length - 1].content
        : "What is the primary factor driving this decision?";

    // L3: Combined model turn call
    const turnResult = await runTurnInterrogation(
      {
        decision_statement: situation.decision_statement,
        domain: situation.domain,
        options: situation.options,
        key_entities: situation.key_entities,
        in_scope_topics: situation.in_scope_topics,
        raw_input: situation.raw_input,
      },
      situation.decision_state,
      history.map((m) => ({ role: m.role, content: m.content })),
      message,
      session.question_count
    );

    // Off-Topic Handling (Section 7)
    if (turnResult.scope === "OFF_TOPIC") {
      const newStrikes = session.strike_count + 1;
      await updateSession(sessionId, { strike_count: newStrikes });

      // Save user message as off-topic
      await addMessage(sessionId, "user", message, "OFF_TOPIC");

      // Server-written reminder (Model NEVER writes reminder text)
      const reminderText = buildReminder(
        { decision_statement: situation.decision_statement },
        newStrikes
      );

      await addMessage(sessionId, "system_note", reminderText, null);

      return NextResponse.json({
        action: "REMINDER",
        message: reminderText,
        lastQuestion,
        strikes: newStrikes,
        paused: newStrikes >= 3,
      });
    }

    // On-topic: Reset strikes
    await updateSession(sessionId, { strike_count: 0 });

    // Record user message
    await addMessage(sessionId, "user", message, turnResult.scope);

    // Update Decision State
    const updatedState = mergeDecisionState(
      situation.decision_state,
      turnResult.stateUpdate,
      turnResult.category
    );

    await updateSituation(sessionId, {
      decision_state: updatedState,
    });

    const newQuestionCount = session.question_count + 1;

    // Hard cap check: 6 questions max, or FINISH requested after 4 questions
    const shouldFinish =
      newQuestionCount >= 6 ||
      (turnResult.action === "FINISH" && newQuestionCount >= 4);

    if (shouldFinish) {
      await updateSession(sessionId, {
        question_count: newQuestionCount,
      });

      return NextResponse.json({
        action: "FINISH",
        sessionId,
        perspectivesExplored: updatedState.exploredDimensions.length,
        questionCount: newQuestionCount,
      });
    }

    // Ensure valid question
    let questionToAsk = turnResult.question;
    const qVal = validateQuestionLayer4(questionToAsk);
    if (!qVal.valid || !questionToAsk) {
      questionToAsk = SAFE_FALLBACK_QUESTION;
    }

    // Record assistant question in database
    await addMessage(sessionId, "assistant", questionToAsk, null);

    await updateSession(sessionId, {
      question_count: newQuestionCount,
    });

    return NextResponse.json({
      action: "ASK_QUESTION",
      question: questionToAsk,
      category: turnResult.category,
      reflection: turnResult.reflection,
      needsEvidence: turnResult.needsEvidence,
      evidenceQuery: turnResult.evidenceQuery,
      perspectivesExplored: updatedState.exploredDimensions.length,
      questionCount: newQuestionCount,
    });
  } catch (err: unknown) {
    console.error("Error in /api/analyze/question:", err);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to evaluate answer." },
      { status: 500 }
    );
  }
}
