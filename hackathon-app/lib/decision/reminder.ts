export interface ReminderSituation {
  decision_statement: string;
}

export function buildReminder(s: ReminderSituation, strikes: number): string {
  if (strikes >= 3) {
    return `This session is paused because several messages were unrelated to your decision: "${s.decision_statement}". Start a new session or reply with something about this decision to continue.`;
  }
  return `Quick reminder: this session is about your decision:
"${s.decision_statement}"

I can't help with unrelated topics here. If it connects to your decision, tell me how and we'll continue. Otherwise, let's return to the last question.`;
}
