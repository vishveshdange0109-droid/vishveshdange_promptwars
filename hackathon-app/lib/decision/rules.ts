export const SAFE_FALLBACK_QUESTION =
  "What is the single biggest thing you're unsure about in this decision?";

export const RECOMMENDATION_PATTERNS = [
  /\byou\s+should\b/i,
  /\bi\s+recommend\b/i,
  /\bmy\s+advice\b/i,
  /\byou\s+ought\s+to\b/i,
  /\bi\s+suggest\s+you\b/i,
  /\byou\s+must\s+choose\b/i,
  /\bthe\s+best\s+choice\s+is\b/i,
  /\bmy\s+recommendation\b/i,
];

// Layer 1: Deterministic rules (length, empty checks)
export function validateInputLayer1(input: string): { valid: boolean; error?: string } {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return { valid: false, error: "Input cannot be empty." };
  }
  if (trimmed.length > 2000) {
    return {
      valid: false,
      error: "Input exceeds maximum limit of 2,000 characters. Please be concise.",
    };
  }
  return { valid: true };
}

// Layer 4: Deterministic validation for generated questions
export function validateQuestionLayer4(question: string | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!question || typeof question !== "string") {
    return { valid: false, error: "Question is missing or empty." };
  }

  const trimmed = question.trim();

  // Must end with a question mark
  if (!trimmed.endsWith("?")) {
    return { valid: false, error: "Question must end with a question mark." };
  }

  // Must be under 300 characters
  if (trimmed.length > 300) {
    return { valid: false, error: "Question exceeds 300 characters." };
  }

  // No code fences
  if (trimmed.includes("```")) {
    return { valid: false, error: "Question contains code fences." };
  }

  // No markdown headers
  if (/^#+\s+/m.test(trimmed)) {
    return { valid: false, error: "Question contains markdown headers." };
  }

  // Exactly one question per response (count question marks)
  const questionMarks = (trimmed.match(/\?/g) || []).length;
  if (questionMarks !== 1) {
    return { valid: false, error: "Must contain exactly one question." };
  }

  // No recommendation language
  for (const pattern of RECOMMENDATION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        error: `Question contains recommendation phrase matching ${pattern}`,
      };
    }
  }

  return { valid: true };
}

// Layer 4: Ensure no recommendation phrases exist anywhere in text/arrays
export function sanitizeNoRecommendations(text: string): boolean {
  for (const pattern of RECOMMENDATION_PATTERNS) {
    if (pattern.test(text)) {
      return false;
    }
  }
  return true;
}
