"use client";

import React, { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Examining your reflection & checking scope...",
  "Searching for hidden assumptions...",
  "Stress-testing downside reversibility...",
  "Synthesizing next high-impact question...",
];

export function LoadingStates({ label }: { label?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-4 tt-fade-in">
      <div className="flex items-center space-x-3">
        <span className="inline-block w-3 h-3 bg-[#0B8A3E] tt-pulse-dot" />
        <p className="font-plex text-xl font-semibold tracking-wide text-[#0A0A0A]">
          {label || LOADING_MESSAGES[index]}
        </p>
      </div>
      <div className="w-56 h-[3px] bg-[#0A0A0A] opacity-20 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-[#0B8A3E] w-1/2 animate-[shimmer_1.4s_infinite]" />
      </div>
    </div>
  );
}
