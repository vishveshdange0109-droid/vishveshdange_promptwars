import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col justify-between">
      {/* Top Banner Bar */}
      <div className="border-b border-[#0A0A0A] bg-white py-2 px-6 sm:px-12 text-xs font-plex flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 bg-[#0B8A3E] inline-block tt-pulse-dot" />
          <span className="font-semibold text-[#0A0A0A]">
            THINK TWICE // v3.0
          </span>
          <span className="hidden sm:inline text-gray-400">|</span>
          <span className="hidden sm:inline text-gray-600 font-medium">
            DECISION INTERROGATION ENGINE
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="border border-[#0B8A3E] text-[#0B8A3E] px-2 py-0.5 uppercase tracking-wider font-semibold text-[11px]">
            ZERO ADVICE POLICY
          </span>
        </div>
      </div>

      {/* Main Expansive Content */}
      <main className="w-full max-w-[1000px] mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-16 flex-1 flex flex-col justify-center">
        {/* Navigation Bar */}
        <header className="border-b border-[#0A0A0A] pb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-[#0B8A3E] inline-block" />
            <span className="font-serif text-3xl tracking-tight font-normal text-[#0A0A0A]">
              Think Twice
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/think"
              className="tt-btn-secondary px-5 py-2 font-plex text-xs uppercase tracking-wider font-semibold"
            >
              Open Terminal →
            </Link>
          </div>
        </header>

        {/* Minimal, Refined Editorial Hero Section */}
        <section className="space-y-8 max-w-[820px] mx-auto text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 border border-[#0A0A0A] px-3.5 py-1 bg-white shadow-[2px_2px_0px_#0B8A3E]">
            <span className="w-2 h-2 bg-[#0B8A3E] inline-block tt-pulse-dot" />
            <span className="font-plex text-xs text-[#0A0A0A] tracking-wider uppercase font-semibold">
              DECISION REFLECTION &amp; INTERROGATION SYSTEM
            </span>
          </div>

          {/* Headline featuring the sovereign quote in optimal editorial scale */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-normal leading-[1.18] tracking-tight text-[#0A0A0A]">
            You still make the decision.{" "}
            <span className="italic text-[#0B8A3E]">
              Think Twice doesn't tell you what to do.
            </span>{" "}
            It makes sure you know what you're actually deciding.
          </h1>

          <div className="space-y-3 pt-1">
            <p className="font-serif text-2xl sm:text-3xl italic text-[#0A0A0A]">
              Think Twice. Decide Once.
            </p>
            <p className="font-plex text-base sm:text-lg text-gray-700 leading-relaxed font-normal max-w-[680px]">
              AI that doesn't tell you what to decide. It asks what you haven't considered.
              Binds your dilemma into a verified scope contract, exposes fragile assumptions,
              tests fallback reversibility, and synthesizes a structured Decision Landscape.
            </p>
          </div>

          {/* Start Chat Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center sm:items-center gap-5 justify-center sm:justify-start">
            <Link
              href="/think"
              className="tt-btn-primary px-8 py-3.5 font-plex text-sm uppercase tracking-wider font-bold inline-flex items-center space-x-2.5 shadow-[3px_3px_0px_#0B8A3E]"
            >
              <span>Start Chat →</span>
            </Link>

            <div className="flex items-center space-x-3 text-xs font-plex text-gray-600 font-medium">
              <span>[1 QUESTION AT A TIME]</span>
              <span>•</span>
              <span>[MAX 6 QUESTIONS]</span>
              <span>•</span>
              <span className="text-[#0B8A3E] font-semibold">[ZERO ADVICE]</span>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Black & White Footer */}
      <Footer />
    </div>
  );
}
