"use client";

import React, { useState } from "react";

interface QuestionViewProps {
  question: string;
  category: string;
  reflection?: string | null;
  needsEvidence?: boolean;
  evidenceQuery?: string | null;
  perspectivesExplored: number;
  questionCount: number;
  totalCap?: number;
  onSubmitAnswer: (answer: string) => void;
  isLoading: boolean;
  onFinishEarly?: () => void;
}

export function QuestionView({
  question,
  category,
  reflection,
  needsEvidence,
  evidenceQuery,
  perspectivesExplored,
  questionCount,
  totalCap = 6,
  onSubmitAnswer,
  isLoading,
  onFinishEarly,
}: QuestionViewProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    onSubmitAnswer(answer.trim());
    setAnswer("");
  };

  return (
    <div className="space-y-7 tt-fade-in">
      {/* Telemetry & Perspectives Explored Indicator */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#0A0A0A] pb-4 text-sm font-plex gap-3 bg-white">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 bg-[#0B8A3E] inline-block tt-pulse-dot" />
          <span className="text-[#0A0A0A] uppercase tracking-wider font-bold text-sm">
            PERSPECTIVES EXPLORED: {perspectivesExplored} OF {totalCap}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[#0A0A0A]">
          <span className="font-semibold text-sm">QUESTION {questionCount} OF {totalCap}</span>
          <span className="border-2 border-[#0B8A3E] text-[#0B8A3E] px-3 py-1 uppercase tracking-wider font-bold text-xs bg-white shadow-[2px_2px_0px_#0B8A3E]">
            {category}
          </span>
        </div>
      </div>

      {/* Optional Prior Reflection */}
      {reflection && (
        <div className="p-4 border-2 border-[#0A0A0A] bg-[#FAFAFA] font-plex text-base text-[#0A0A0A] flex items-start space-x-3 shadow-[2px_2px_0px_#0A0A0A]">
          <span className="text-[#0B8A3E] font-bold text-sm uppercase shrink-0 pt-0.5">[SYNTHESIS]:</span>
          <span className="italic leading-relaxed font-medium">"{reflection}"</span>
        </div>
      )}

      {/* Active Question Box with IBM Plex Serif */}
      <div className="tt-card-interactive p-7 sm:p-9 space-y-4 bg-white">
        <div className="flex items-center justify-between border-b border-[#0A0A0A] pb-3">
          <span className="font-plex text-xs text-[#0B8A3E] uppercase tracking-wider font-bold flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#0B8A3E]" />
            <span>INTERROGATION QUESTION</span>
          </span>
          <span className="font-plex text-xs text-[#0A0A0A] font-bold">
            DIMENSION: {category}
          </span>
        </div>

        <h2 className="font-plex text-3xl sm:text-4xl font-semibold leading-[1.25] text-[#0A0A0A] pt-1">
          {question}
        </h2>
      </div>

      {/* Needs Evidence Notice (MVP Section 10) */}
      {needsEvidence && (
        <div className="p-4 border-2 border-[#0A0A0A] border-dashed bg-white flex items-start space-x-3 shadow-[2px_2px_0px_#0A0A0A]">
          <span className="font-plex text-base text-[#0B8A3E] font-bold">[*]</span>
          <div className="font-plex text-sm text-[#0A0A0A]">
            <span className="font-bold">Factual claim identified:</span> This response contains an empirical premise worth verifying
            {evidenceQuery ? `: "${evidenceQuery}"` : "."}
          </div>
        </div>
      )}

      {/* Answer Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="answer-textarea"
            className="font-plex text-xs uppercase tracking-wider text-[#0A0A0A] block flex items-center justify-between font-bold"
          >
            <span>YOUR REFLECTION / EVIDENCE</span>
            <span className="text-xs text-[#666666] font-normal">Natural reflection &amp; concrete facts welcome</span>
          </label>
          <textarea
            id="answer-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your candid reflection, evidence, or boundary condition here..."
            rows={5}
            maxLength={2000}
            disabled={isLoading}
            className="w-full border-2 border-[#0A0A0A] p-5 font-plex text-lg leading-relaxed text-[#0A0A0A] placeholder:text-[#888888] focus:outline-none focus:border-[#0B8A3E] bg-white resize-y shadow-[3px_3px_0px_#0A0A0A] focus:shadow-[4px_4px_0px_#0B8A3E] transition-all"
          />
          <div className="flex justify-between items-center text-xs font-plex font-bold text-[#0A0A0A] px-1 pt-1">
            <span>ANSWERS ARE DATA // NEVER SHARED OR JUDGED</span>
            <span>{answer.length} / 2,000</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {questionCount >= 4 && onFinishEarly ? (
            <button
              type="button"
              onClick={onFinishEarly}
              disabled={isLoading}
              className="tt-btn-secondary px-5 py-3 font-plex text-xs uppercase tracking-wider font-bold text-left"
            >
              Generate Landscape Dossier Early →
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isLoading || !answer.trim()}
            className="tt-btn-primary px-9 py-4 font-plex text-sm uppercase tracking-wider font-bold shadow-[4px_4px_0px_#0B8A3E]"
          >
            {isLoading ? "Evaluating Answer..." : "Submit Answer →"}
          </button>
        </div>
      </form>
    </div>
  );
}
