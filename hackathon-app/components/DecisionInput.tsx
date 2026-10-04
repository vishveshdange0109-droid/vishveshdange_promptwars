"use client";

import React, { useState } from "react";

interface DecisionInputProps {
  onSubmit: (decision: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  clarifyingQuestion?: string | null;
}

export function DecisionInput({
  onSubmit,
  isLoading,
  errorMessage,
  clarifyingQuestion,
}: DecisionInputProps) {
  const [decision, setDecision] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim() || isLoading) return;
    onSubmit(decision.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 tt-fade-in">
      <div className="space-y-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 bg-[#0B8A3E] inline-block tt-pulse-dot" />
          <span className="font-plex text-xs uppercase tracking-wider text-[#0B8A3E] font-bold">
            STAGE 01 // SITUATION ANALYZER &amp; SCOPE ANCHOR
          </span>
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#0A0A0A] leading-tight">
          Describe the decision you are facing.
        </h2>
        <p className="font-plex text-base text-[#0A0A0A] leading-relaxed font-medium">
          State the real dilemma in your own words. Think Twice will analyze the
          situation, bind the scope contract, and begin systematic interrogation.
        </p>
      </div>

      {clarifyingQuestion && (
        <div className="p-5 border-2 border-[#0B8A3E] bg-[#FAFAFA] space-y-2 shadow-[3px_3px_0px_#0B8A3E] tt-fade-in">
          <span className="font-plex text-xs text-[#0B8A3E] uppercase font-bold tracking-wider flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#0B8A3E]" />
            <span>CLARIFYING QUESTION REQUIRED:</span>
          </span>
          <p className="font-plex text-2xl font-semibold text-[#0A0A0A] leading-snug">
            {clarifyingQuestion}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="p-5 border-2 border-[#0A0A0A] bg-white space-y-1.5 shadow-[3px_3px_0px_#0A0A0A] tt-fade-in">
          <span className="font-plex text-xs text-red-600 uppercase font-bold tracking-wider">
            [SCOPE POLICY NOTICE]:
          </span>
          <p className="font-plex text-base text-[#0A0A0A] font-semibold">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-2">
        <textarea
          id="decision-textarea"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="e.g., I'm thinking about leaving college to work full-time on my startup..."
          maxLength={2000}
          rows={6}
          disabled={isLoading}
          className="w-full border-2 border-[#0A0A0A] p-5 font-plex text-lg leading-relaxed text-[#0A0A0A] placeholder:text-[#888888] focus:outline-none focus:border-[#0B8A3E] bg-white resize-y shadow-[3px_3px_0px_#0A0A0A] focus:shadow-[4px_4px_0px_#0B8A3E] transition-all font-medium"
        />
        <div className="flex justify-between items-center text-xs font-plex font-bold text-[#0A0A0A] px-1 pt-1">
          <span>MAX 2,000 CHARACTERS // TREAT STRICTLY AS DATA</span>
          <span>{decision.length} / 2,000</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
        <button
          type="submit"
          disabled={isLoading || !decision.trim()}
          className="tt-btn-primary px-9 py-4 font-plex text-sm uppercase tracking-wider font-bold w-full sm:w-auto flex items-center justify-center space-x-2.5 shadow-[4px_4px_0px_#0B8A3E]"
        >
          <span>{isLoading ? "Analyzing Scope Contract..." : "Analyze Decision Scope"}</span>
          <span className="font-bold">→</span>
        </button>
      </div>
    </form>
  );
}
