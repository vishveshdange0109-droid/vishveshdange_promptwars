import { NextRequest, NextResponse } from "next/server";
import { getSession, getSituationBySessionId, getMessagesBySessionId } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(id);
    const situation = await getSituationBySessionId(id);
    const messages = await getMessagesBySessionId(id);

    if (!session || !situation) {
      return NextResponse.json(
        { status: "ERROR", message: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session,
      situation: {
        id: situation.id,
        decisionStatement: situation.decision_statement,
        domain: situation.domain,
        options: situation.options,
        keyEntities: situation.key_entities,
        inScopeTopics: situation.in_scope_topics,
        confirmed: situation.confirmed,
        decisionState: situation.decision_state,
      },
      messages,
    });
  } catch (err: unknown) {
    console.error("Error fetching session:", err);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
