"use client";

import React from "react";

interface ReminderNoteProps {
  message: string;
  lastQuestion: string;
  strikes: number;
  paused: boolean;
}

export function ReminderNote({
  message,
  lastQuestion,
  strikes,
  paused,
}: ReminderNoteProps) {
  return (
    <div className="my-6 border-2 border-[#0A0A0A] p-6 bg-white space-y-4 shadow-[4px_4px_0px_#0A0A0A] tt-fade-in">
      <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 bg-[#0B8A3E] inline-block tt-pulse-dot" />
          <span className="font-plex text-xs uppercase tracking-wider text-[#0B8A3E] font-bold">
            SYSTEM REMINDER: SCOPE ANCHOR DEFENSE
          </span>
        </div>
        <span className="font-plex text-xs text-[#0A0A0A] border-2 border-[#0A0A0A] px-2.5 py-0.5 font-bold">
          STRIKE {strikes} / 3 {paused ? "[PAUSED]" : ""}
        </span>
      </div>

      <div className="font-plex text-base font-medium leading-relaxed text-[#0A0A0A] whitespace-pre-line">
        {message}
      </div>

      {lastQuestion && (
        <div className="pt-4 border-t-2 border-[#0A0A0A] border-dashed space-y-2">
          <p className="font-plex text-xs text-[#0B8A3E] uppercase tracking-wide font-bold">
            ACTIVE DECISION QUESTION TO ANSWER:
          </p>
          <p className="font-plex text-xl font-semibold text-[#0A0A0A] leading-snug">
            {lastQuestion}
          </p>
        </div>
      )}
    </div>
  );
}
