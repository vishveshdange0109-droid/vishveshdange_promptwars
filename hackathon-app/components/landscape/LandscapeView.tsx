"use client";

import React, { useState } from "react";
import { DecisionLandscape } from "@/lib/ai/schemas";

interface LandscapeViewProps {
  landscape: DecisionLandscape;
  onNewSession: () => void;
}

export function LandscapeView({ landscape, onNewSession }: LandscapeViewProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# THINK TWICE — DECISION LANDSCAPE
**Decision:** ${landscape.decision}

## 1. What We Know
${landscape.whatWeKnow.map((item) => `- ${item}`).join("\n")}

## 2. Assumptions
${landscape.assumptions.map((item) => `- ${item}`).join("\n")}

## 3. Evidence
${landscape.evidence.map((item) => `- ${item}`).join("\n")}

## 4. Consequences
${landscape.consequences.map((item) => `- ${item}`).join("\n")}

## 5. Second-Order Effects
${landscape.secondOrderEffects.map((item) => `- ${item}`).join("\n")}

## 6. Trade-offs
${landscape.tradeoffs.map((item) => `- ${item}`).join("\n")}

## 7. Opportunity Costs
${landscape.opportunityCosts.map((item) => `- ${item}`).join("\n")}

## 8. Risks
${landscape.risks.map((item) => `- ${item}`).join("\n")}

## 9. Unknowns
${landscape.unknowns.map((item) => `- ${item}`).join("\n")}

## 10. Scenarios
- **Best Case:** ${landscape.scenarios.bestCase}
- **Worst Case:** ${landscape.scenarios.worstCase}
- **Plausible Case:** ${landscape.scenarios.plausibleCase}

## 11. Critical Question
> ${landscape.criticalQuestion}

---
*${landscape.closingLine}*
`.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-10 tt-fade-in print:p-0">
      {/* Worksheet Header */}
      <div className="tt-card-interactive p-7 sm:p-10 space-y-4 bg-white">
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#0A0A0A] pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-[#0B8A3E] inline-block tt-pulse-dot" />
            <h1 className="font-plex text-xs uppercase tracking-widest text-[#0A0A0A] font-bold">
              DECISION LANDSCAPE WORKSHEET
            </h1>
          </div>
          <span className="font-plex text-xs text-[#0B8A3E] border-2 border-[#0B8A3E] px-3 py-1 font-bold shadow-[2px_2px_0px_#0B8A3E]">
            INTERROGATION COMPLETE
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <span className="font-plex text-xs text-[#0B8A3E] uppercase tracking-wider block font-bold">
            EXAMINED DECISION
          </span>
          <p className="font-serif text-3xl sm:text-5xl font-normal text-[#0A0A0A] leading-tight">
            {landscape.decision}
          </p>
        </div>
      </div>

      {/* Critical Question Callout */}
      <div className="border-2 border-[#0B8A3E] p-7 sm:p-10 bg-white space-y-4 shadow-[5px_5px_0px_#0B8A3E]">
        <div className="flex items-center justify-between border-b-2 border-[#0B8A3E] pb-3">
          <span className="font-plex text-xs uppercase tracking-wider text-[#0B8A3E] font-bold flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-[#0B8A3E]" />
            <span>CRITICAL UNRESOLVED QUESTION</span>
          </span>
          <span className="font-plex text-xs text-[#0A0A0A] font-bold">
            PRIMARY PIVOT POINT
          </span>
        </div>
        <p className="font-plex text-2xl sm:text-3xl font-semibold text-[#0A0A0A] leading-snug pt-1">
          {landscape.criticalQuestion}
        </p>
      </div>

      {/* Core Dimensions Grid */}
      <div className="space-y-7">
        {/* Row 1: What We Know & Assumptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <SectionCard title="WHAT WE KNOW" items={landscape.whatWeKnow} tag="ESTABLISHED" />
          <SectionCard title="ASSUMPTIONS" items={landscape.assumptions} tag="BELIEFS" />
        </div>

        {/* Row 2: Evidence & Trade-offs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <SectionCard title="EVIDENCE & VERIFICATION" items={landscape.evidence} tag="VERIFIED" />
          <SectionCard title="TRADE-OFFS" items={landscape.tradeoffs} tag="SACRIFICES" />
        </div>

        {/* Row 3: Consequences & Second-order effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <SectionCard title="CONSEQUENCES" items={landscape.consequences} tag="DIRECT" />
          <SectionCard title="SECOND-ORDER EFFECTS" items={landscape.secondOrderEffects} tag="RIPPLES" />
        </div>

        {/* Row 4: Opportunity costs & Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <SectionCard title="OPPORTUNITY COSTS" items={landscape.opportunityCosts} tag="FOREGONE" />
          <SectionCard title="RISKS & HAZARDS" items={landscape.risks} tag="DOWNSIDE" />
        </div>

        {/* Unknowns */}
        <div className="border-2 border-[#0A0A0A] p-6 bg-white space-y-4 shadow-[3px_3px_0px_#0A0A0A]">
          <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-3">
            <h3 className="font-plex text-xs uppercase tracking-wider font-bold text-[#0A0A0A]">
              UNKNOWNS (UNRESOLVED BLIND SPOTS)
            </h3>
            <span className="font-plex text-xs text-[#0A0A0A] border border-[#0A0A0A] px-2 py-0.5 font-bold">
              UNCERTAINTIES
            </span>
          </div>
          <ul className="space-y-2.5 font-plex text-sm text-[#0A0A0A] font-medium">
            {landscape.unknowns.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <span className="text-[#0B8A3E] font-bold text-base">?</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Three Scenarios */}
        <div className="border-2 border-[#0A0A0A] p-7 bg-white space-y-5 shadow-[3px_3px_0px_#0A0A0A]">
          <div className="border-b-2 border-[#0A0A0A] pb-3">
            <h3 className="font-plex text-xs uppercase tracking-wider font-bold text-[#0A0A0A]">
              SCENARIO SIMULATION
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-plex">
            <div className="p-4 border-2 border-[#0A0A0A] space-y-2 bg-[#FAFAFA] shadow-[2px_2px_0px_#0A0A0A]">
              <span className="text-xs text-[#0B8A3E] font-bold block uppercase tracking-wider">
                BEST CASE
              </span>
              <p className="text-sm text-[#0A0A0A] leading-relaxed font-medium">
                {landscape.scenarios.bestCase}
              </p>
            </div>
            <div className="p-4 border-2 border-[#0A0A0A] space-y-2 bg-[#FAFAFA] shadow-[2px_2px_0px_#0A0A0A]">
              <span className="text-xs text-[#0A0A0A] font-bold block uppercase tracking-wider">
                PLAUSIBLE CASE
              </span>
              <p className="text-sm text-[#0A0A0A] leading-relaxed font-medium">
                {landscape.scenarios.plausibleCase}
              </p>
            </div>
            <div className="p-4 border-2 border-[#0A0A0A] space-y-2 bg-[#FAFAFA] shadow-[2px_2px_0px_#0A0A0A]">
              <span className="text-xs text-red-600 font-bold block uppercase tracking-wider">
                WORST CASE
              </span>
              <p className="text-sm text-[#0A0A0A] leading-relaxed font-medium">
                {landscape.scenarios.worstCase}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Application Closing Line in IBM Plex Serif */}
      <div className="border-2 border-[#0A0A0A] p-9 bg-white text-center space-y-3 shadow-[4px_4px_0px_#0A0A0A]">
        <p className="font-plex text-2xl sm:text-3xl font-semibold text-[#0A0A0A] leading-snug">
          "{landscape.closingLine}"
        </p>
        <span className="font-plex text-xs text-[#0B8A3E] uppercase tracking-widest block font-bold">
          THINK TWICE. DECIDE ONCE.
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t-2 border-[#0A0A0A] print:hidden">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="tt-btn-secondary px-5 py-3 font-plex text-xs uppercase tracking-wider font-bold"
          >
            {copied ? "Copied Markdown!" : "Copy Markdown"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="tt-btn-secondary px-5 py-3 font-plex text-xs uppercase tracking-wider font-bold"
          >
            Print Worksheet
          </button>
        </div>

        <button
          type="button"
          onClick={onNewSession}
          className="tt-btn-primary px-8 py-3.5 font-plex text-sm uppercase tracking-wider font-bold flex items-center space-x-2 shadow-[4px_4px_0px_#0B8A3E]"
        >
          <span>Start New Decision Session</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  items,
  tag,
}: {
  title: string;
  items: string[];
  tag: string;
}) {
  return (
    <div className="border-2 border-[#0A0A0A] p-6 bg-white space-y-3 shadow-[3px_3px_0px_#0A0A0A] hover:shadow-[5px_5px_0px_#0B8A3E] hover:border-[#0B8A3E] transition-all">
      <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-2.5">
        <h3 className="font-plex text-xs uppercase tracking-wider font-bold text-[#0A0A0A]">
          {title}
        </h3>
        <span className="font-plex text-xs text-[#0A0A0A] border border-[#0A0A0A] px-2 py-0.5 font-bold">
          {tag}
        </span>
      </div>
      <ul className="space-y-2.5 font-plex text-sm leading-relaxed text-[#0A0A0A] font-medium">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2.5">
              <span className="text-[#0B8A3E] font-bold text-base">▪</span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="italic text-[#888888]">None identified</li>
        )}
      </ul>
    </div>
  );
}
