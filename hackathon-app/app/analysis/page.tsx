"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LandscapeView } from "@/components/landscape/LandscapeView";
import { LoadingStates } from "@/components/LoadingStates";
import { Footer } from "@/components/Footer";
import { DecisionLandscape } from "@/lib/ai/schemas";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  const [landscape, setLandscape] = useState<DecisionLandscape | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("No session ID specified. Start a session to generate a Decision Landscape.");
      return;
    }

    async function fetchLandscape() {
      try {
        const res = await fetch("/api/analyze/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        if (!res.ok || data.status === "ERROR") {
          setError(data.message || "Failed to generate landscape.");
        } else {
          setLandscape(data.landscape);
        }
      } catch (err) {
        console.error(err);
        setError("Network error fetching landscape.");
      } finally {
        setLoading(false);
      }
    }

    fetchLandscape();
  }, [sessionId]);

  const handleNewSession = () => {
    router.push("/think");
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col justify-between">
      {/* Top Banner Bar */}
      <div className="border-b-2 border-[#0A0A0A] bg-white py-2.5 px-6 sm:px-12 text-xs font-plex flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 bg-[#0B8A3E] inline-block tt-pulse-dot" />
          <span className="font-bold text-[#0A0A0A] tracking-wide">
            DECISION LANDSCAPE WORKSHEET
          </span>
          <span className="hidden sm:inline text-[#888888]">|</span>
          <span className="hidden sm:inline text-[#0A0A0A] font-semibold">
            SYNTHESIS COMPLETE
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="border-2 border-[#0B8A3E] text-[#0B8A3E] px-2.5 py-0.5 uppercase tracking-wider font-bold shadow-[1px_1px_0px_#0B8A3E]">
            NO RECOMMENDATION CONTAINED
          </span>
        </div>
      </div>

      <main className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-10 space-y-10 flex-1">
        <header className="border-b-2 border-[#0A0A0A] pb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <span className="w-3 h-3 bg-[#0B8A3E] inline-block tt-pulse-dot" />
            <span className="font-serif text-3xl sm:text-4xl tracking-tight font-normal text-[#0A0A0A] group-hover:text-[#0B8A3E] transition-colors">
              Think Twice
            </span>
          </Link>
          <button
            onClick={handleNewSession}
            className="text-xs font-plex text-[#0A0A0A] hover:text-[#0B8A3E] uppercase underline tracking-wider font-bold"
          >
            Start New Session
          </button>
        </header>

        {loading && <LoadingStates label="Synthesizing Decision Landscape..." />}

        {error && (
          <div className="border-2 border-[#0A0A0A] p-8 space-y-4 max-w-[640px] mx-auto shadow-[4px_4px_0px_#0A0A0A]">
            <span className="font-plex text-xs text-red-600 uppercase font-bold block">
              [SESSION RECORD NOTICE]:
            </span>
            <p className="font-plex text-base text-[#0A0A0A] font-semibold">{error}</p>
            <div className="pt-2">
              <button
                onClick={handleNewSession}
                className="tt-btn-primary px-8 py-3 font-plex text-xs uppercase tracking-wider font-bold shadow-[2px_2px_0px_#0A0A0A]"
              >
                Start New Interrogation Session →
              </button>
            </div>
          </div>
        )}

        {!loading && landscape && (
          <LandscapeView
            landscape={landscape}
            onNewSession={handleNewSession}
          />
        )}
      </main>

      {/* Production Black Footer */}
      <Footer />
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<LoadingStates label="Loading..." />}>
      <AnalysisContent />
    </Suspense>
  );
}
