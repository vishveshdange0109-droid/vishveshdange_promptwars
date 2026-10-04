import { supabase } from "./supabase";
import { DecisionState } from "./decision/state";
import crypto from "crypto";

export interface SessionRecord {
  id: string;
  status: "active" | "completed";
  strike_count: number;
  question_count: number;
  created_at: string;
}

export interface SituationRecord {
  id: string;
  session_id: string;
  raw_input: string;
  decision_statement: string;
  domain: string;
  options: string[];
  key_entities: string[];
  in_scope_topics: string[];
  confirmed: boolean;
  decision_state: DecisionState;
  created_at: string;
}

export interface MessageRecord {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system_note";
  content: string;
  scope_label: "ANSWER" | "NEW_RELEVANT_INFO" | "OFF_TOPIC" | null;
  created_at: string;
}

// Global in-memory fallback cache across API requests
interface InMemoryStore {
  sessions: Map<string, SessionRecord>;
  situations: Map<string, SituationRecord>;
  messages: Map<string, MessageRecord[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __thinkTwiceStore: InMemoryStore | undefined;
}

const memoryStore: InMemoryStore =
  global.__thinkTwiceStore || {
    sessions: new Map(),
    situations: new Map(),
    messages: new Map(),
  };

if (process.env.NODE_ENV !== "production") {
  global.__thinkTwiceStore = memoryStore;
}

export async function createSession(): Promise<SessionRecord> {
  const id = crypto.randomUUID();
  const session: SessionRecord = {
    id,
    status: "active",
    strike_count: 0,
    question_count: 0,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        id: session.id,
        status: session.status,
        strike_count: session.strike_count,
        question_count: session.question_count,
      })
      .select()
      .single();

    if (error) {
      console.warn("Supabase sessions insert error, using memory store:", error.message);
      memoryStore.sessions.set(session.id, session);
      return session;
    }
    return data as SessionRecord;
  }

  memoryStore.sessions.set(session.id, session);
  return session;
}

export async function getSession(sessionId: string): Promise<SessionRecord | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!error && data) {
      return data as SessionRecord;
    }
  }
  return memoryStore.sessions.get(sessionId) || null;
}

export async function updateSession(
  sessionId: string,
  updates: Partial<SessionRecord>
): Promise<void> {
  if (supabase) {
    await supabase.from("sessions").update(updates).eq("id", sessionId);
  }
  const existing = memoryStore.sessions.get(sessionId);
  if (existing) {
    memoryStore.sessions.set(sessionId, { ...existing, ...updates });
  }
}

export async function saveSituation(
  situation: Omit<SituationRecord, "id" | "created_at">
): Promise<SituationRecord> {
  const id = crypto.randomUUID();
  const record: SituationRecord = {
    ...situation,
    id,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("situations")
      .insert({
        id: record.id,
        session_id: record.session_id,
        raw_input: record.raw_input,
        decision_statement: record.decision_statement,
        domain: record.domain,
        options: record.options,
        key_entities: record.key_entities,
        in_scope_topics: record.in_scope_topics,
        confirmed: record.confirmed,
        decision_state: record.decision_state,
      })
      .select()
      .single();

    if (error) {
      console.warn("Supabase situations insert error, using memory store:", error.message);
      memoryStore.situations.set(record.session_id, record);
      return record;
    }
    return data as SituationRecord;
  }

  memoryStore.situations.set(record.session_id, record);
  return record;
}

export async function getSituationBySessionId(
  sessionId: string
): Promise<SituationRecord | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("situations")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      return data as SituationRecord;
    }
  }
  return memoryStore.situations.get(sessionId) || null;
}

export async function updateSituation(
  sessionId: string,
  updates: Partial<SituationRecord>
): Promise<void> {
  if (supabase) {
    await supabase
      .from("situations")
      .update(updates)
      .eq("session_id", sessionId);
  }
  const existing = memoryStore.situations.get(sessionId);
  if (existing) {
    memoryStore.situations.set(sessionId, { ...existing, ...updates });
  }
}

export async function addMessage(
  sessionId: string,
  role: "user" | "assistant" | "system_note",
  content: string,
  scopeLabel: "ANSWER" | "NEW_RELEVANT_INFO" | "OFF_TOPIC" | null = null
): Promise<MessageRecord> {
  const id = crypto.randomUUID();
  const record: MessageRecord = {
    id,
    session_id: sessionId,
    role,
    content,
    scope_label: scopeLabel,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    await supabase.from("messages").insert(record);
  }

  const list = memoryStore.messages.get(sessionId) || [];
  list.push(record);
  memoryStore.messages.set(sessionId, list);

  return record;
}

export async function getMessagesBySessionId(
  sessionId: string
): Promise<MessageRecord[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      return data as MessageRecord[];
    }
  }
  return memoryStore.messages.get(sessionId) || [];
}
