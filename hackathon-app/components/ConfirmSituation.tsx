"use client";

import React, { useState } from "react";

interface SituationData {
  decisionStatement: string;
  domain?: string;
  options?: string[];
  statedGoal?: string;
  inScopeTopics?: string[];
  keyEntities?: string[];
  missingContext?: string[];
}

interface ConfirmSituationProps {
  situation: SituationData;
  onConfirm: (editedStatement?: string) => void;
  isLoading: boolean;
}

export function ConfirmSituation({
  situation,
  onConfirm,
  isLoading,
}: ConfirmSituationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [statement, setStatement] = useState(situation.decisionStatement);

  const handleSaveAndConfirm = () => {
    onConfirm(statement);
  };

  return (
    <div className="space-y-6 tt-fade-in">
      <div className="tt-card-interactive p-7 sm:p-9 space-y-7 bg-white">
        <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-3.5">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 bg-[#0B8A3E] inline-block tt-pulse-dot" />
            <h2 className="font-plex text-xs uppercase tracking-wider text-[#0A0A0A] font-bold">
              SCOPE CONTRACT CONFIRMATION
            </h2>
          </div>
          <span className="font-plex text-xs text-[#0B8A3E] border-2 border-[#0B8A3E] px-2.5 py-0.5 font-bold shadow-[1px_1px_0px_#0B8A3E]">
            STAGE 02 // BINDING SCOPE
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#0A0A0A]">
            Review your decision contract.
          </h1>
          <p className="font-plex text-sm text-[#0A0A0A] font-medium leading-relaxed">
            This structured record anchors what is in-scope for all subsequent questions.
            Anything outside these boundaries will be deflected with a server reminder.
          </p>
        </div>

        {/* Decision Statement */}
        <div className="space-y-2.5">
          <label className="font-plex text-xs uppercase tracking-wider text-[#0B8A3E] font-bold block">
            FORMAL DECISION STATEMENT
          </label>
          {isEditing ? (
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full border-2 border-[#0A0A0A] p-5 font-plex text-2xl font-semibold focus:outline-none focus:border-[#0B8A3E] bg-white shadow-[3px_3px_0px_#0A0A0A]"
              rows={3}
            />
          ) : (
            <div className="p-5 border-2 border-[#0A0A0A] font-plex text-2xl sm:text-3xl font-semibold bg-[#FAFAFA] text-[#0A0A0A] leading-snug shadow-[2px_2px_0px_#0A0A0A]">
              "{statement}"
            </div>
          )}
        </div>

        {/* Stated Goal */}
        {situation.statedGoal && (
          <div className="space-y-1.5 border-t border-[#0A0A0A] pt-4">
            <span className="font-plex text-xs uppercase tracking-wider text-[#0A0A0A] font-bold block">
              PRIMARY STATED GOAL
            </span>
            <p className="font-plex text-base text-[#0A0A0A] font-medium">{situation.statedGoal}</p>
          </div>
        )}

        {/* Options */}
        {situation.options && situation.options.length > 0 && (
          <div className="space-y-2.5 border-t border-[#0A0A0A] pt-4">
            <span className="font-plex text-xs uppercase tracking-wider text-[#0A0A0A] font-bold block">
              IDENTIFIED VIABLE OPTIONS
            </span>
            <ul className="space-y-2 font-plex text-sm">
              {situation.options.map((opt, idx) => (
                <li key={idx} className="flex items-start space-x-3 p-3 border-2 border-[#0A0A0A] bg-white shadow-[2px_2px_0px_#0A0A0A]">
                  <span className="text-[#0B8A3E] font-bold">[{idx + 1}]</span>
                  <span className="font-semibold text-[#0A0A0A]">{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* In-Scope Topics */}
        {situation.inScopeTopics && situation.inScopeTopics.length > 0 && (
          <div className="space-y-2.5 border-t border-[#0A0A0A] border-dashed pt-4">
            <span className="font-plex text-xs uppercase tracking-wider text-[#0A0A0A] font-bold block">
              BOUNDED SCOPE TOPICS (PERMITTED IN INTERROGATION)
            </span>
            <div className="flex flex-wrap gap-2">
              {situation.inScopeTopics.map((topic, i) => (
                <span
                  key={i}
                  className="font-plex text-xs font-semibold border-2 border-[#0A0A0A] px-3 py-1 bg-white hover:border-[#0B8A3E] transition-colors"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-6 border-t-2 border-[#0A0A0A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isLoading}
            className="tt-btn-secondary px-6 py-3 font-plex text-xs uppercase tracking-wider font-bold text-center"
          >
            {isEditing ? "Save Statement Changes" : "Edit Statement"}
          </button>

          <button
            type="button"
            onClick={handleSaveAndConfirm}
            disabled={isLoading || !statement.trim()}
            className="tt-btn-primary px-9 py-4 font-plex text-sm uppercase tracking-wider font-bold flex items-center justify-center space-x-2.5 shadow-[4px_4px_0px_#0B8A3E]"
          >
            <span>{isLoading ? "Locking Scope..." : "Yes, Lock Scope & Begin"}</span>
            <span className="font-bold">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
