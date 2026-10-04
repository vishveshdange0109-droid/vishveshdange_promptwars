"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DecisionInput } from "@/components/DecisionInput";
import { ConfirmSituation } from "@/components/ConfirmSituation";
import { QuestionView } from "@/components/QuestionView";
import { ReminderNote } from "@/components/ReminderNote";
import { LoadingStates } from "@/components/LoadingStates";
import { LandscapeView } from "@/components/landscape/LandscapeView";
import { Footer } from "@/components/Footer";
import { DecisionLandscape } from "@/lib/ai/schemas";

type SessionStage = "INPUT" | "CONFIRM" | "SESSION" | "FINISHED";

interface SituationPayload {
  decisionStatement: string;
  domain?: string;
  options?: string[];
  statedGoal?: string;
  inScopeTopics?: string[];
  keyEntities?: string[];
  missingContext?: string[];
}

interface ActiveQuestionData {
  question: string;
  category: string;
  reflection?: string | null;
  needsEvidence?: boolean;
  evidenceQuery?: string | null;
  perspectivesExplored: number;
  questionCount: number;
}

interface ReminderData {
  message: string;
  lastQuestion: string;
  strikes: number;
  paused: boolean;
}

export default function ThinkPage() {
  // Core session state
  const [stage, setStage] = useState<SessionStage>("INPUT");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [situation, setSituation] = useState<SituationPayload | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ActiveQuestionData | null>(null);
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [landscape, setLandscape] = useState<DecisionLandscape | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState<string | undefined>(undefined);
  const [inputError, setInputError] = useState<string | null>(null);
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);

  // Step 1: Submit raw decision for Situation Analysis
  const handleStartAnalysis = async (decisionText: string) => {
    setIsLoading(true);
    setInputError(null);
    setClarifyingQuestion(null);
    setLoadingLabel("Analyzing situation & scope contract...");

    try {
      const res = await fetch("/api/analyze/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: decisionText }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "ERROR") {
        setInputError(data.message || "Failed to analyze decision.");
        setIsLoading(false);
        return;
      }

      if (data.status === "NOT_A_DECISION") {
        setInputError(data.message);
        setIsLoading(false);
        return;
      }

      if (data.status === "NEEDS_CLARIFICATION") {
        setClarifyingQuestion(data.question);
        setIsLoading(false);
        return;
      }

      if (data.status === "NEEDS_CONFIRMATION") {
        setSessionId(data.sessionId);
        setSituation(data.situation);
        setStage("CONFIRM");
      }
    } catch (err) {
      console.error(err);
      setInputError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingLabel(undefined);
    }
  };

  // Step 2: Confirm Situation and generate opening question
  const handleConfirmSituation = async (editedStatement?: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    setLoadingLabel("Formulating opening interrogation question...");

    try {
      const res = await fetch("/api/analyze/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          confirmed: true,
          editedStatement,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "ERROR") {
        alert(data.message || "Error confirming situation.");
        setIsLoading(false);
        return;
      }

      setCurrentQuestion({
        question: data.question,
        category: data.category,
        reflection: null,
        needsEvidence: false,
        evidenceQuery: null,
        perspectivesExplored: data.perspectivesExplored || 1,
        questionCount: data.questionCount || 1,
      });

      setStage("SESSION");
    } catch (err) {
      console.error(err);
      alert("Network error confirming situation.");
    } finally {
      setIsLoading(false);
      setLoadingLabel(undefined);
    }
  };

  // Step 3: Handle answer turn submission
  const handleSubmitAnswer = async (answerText: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    setLoadingLabel("Examining answer & checking scope...");

    try {
      const res = await fetch("/api/analyze/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: answerText,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "ERROR") {
        alert(data.message || "Failed to process turn.");
        setIsLoading(false);
        return;
      }

      // Check if off-topic reminder
      if (data.action === "REMINDER") {
        setReminder({
          message: data.message,
          lastQuestion: data.lastQuestion,
          strikes: data.strikes,
          paused: data.paused,
        });
        setIsLoading(false);
        return;
      }

      // On-topic: clear reminder
      setReminder(null);

      // Check if session finished
      if (data.action === "FINISH") {
        await handleFinalizeSession();
        return;
      }

      // Next question
      if (data.action === "ASK_QUESTION") {
        setCurrentQuestion({
          question: data.question,
          category: data.category,
          reflection: data.reflection,
          needsEvidence: data.needsEvidence,
          evidenceQuery: data.evidenceQuery,
          perspectivesExplored: data.perspectivesExplored,
          questionCount: data.questionCount,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Network error evaluating answer.");
    } finally {
      setIsLoading(false);
      setLoadingLabel(undefined);
    }
  };

  // Step 4: Finalize Decision Landscape
  const handleFinalizeSession = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setLoadingLabel("Synthesizing final Decision Landscape...");

    try {
      const res = await fetch("/api/analyze/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "ERROR") {
        alert(data.message || "Failed to generate decision landscape.");
        setIsLoading(false);
        return;
      }

      setLandscape(data.landscape);
      setStage("FINISHED");
    } catch (err) {
      console.error(err);
      alert("Network error generating landscape.");
    } finally {
      setIsLoading(false);
      setLoadingLabel(undefined);
    }
  };

  const handleResetCurrentStep = () => {
    setReminder(null);
    setInputError(null);
    setClarifyingQuestion(null);
    if (stage === "CONFIRM") {
      setStage("INPUT");
    }
  };

  const handleNewSession = () => {
    if (stage === "SESSION" && !window.confirm("Start a new session? Current progress will be reset.")) {
      return;
    }
    setStage("INPUT");
    setSessionId(null);
    setSituation(null);
    setCurrentQuestion(null);
    setReminder(null);
    setLandscape(null);
    setInputError(null);
    setClarifyingQuestion(null);
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col justify-between">
      {/* Top Banner Bar */}
      <div className="border-b-2 border-[#0A0A0A] bg-white py-2.5 px-6 sm:px-12 text-xs font-plex flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 bg-[#0B8A3E] inline-block tt-pulse-dot" />
          <span className="font-bold text-[#0A0A0A] tracking-wide">
            INTERROGATION TERMINAL
          </span>
          <span className="hidden sm:inline text-[#888888]">|</span>
          <span className="hidden sm:inline text-[#0A0A0A] font-semibold">
            SCOPE: LOCKED
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="border-2 border-[#0A0A0A] px-2.5 py-0.5 uppercase tracking-wider font-bold shadow-[1px_1px_0px_#0A0A0A]">
            {stage}
          </span>
        </div>
      </div>

      <main className="w-full max-w-[1140px] mx-auto px-6 sm:px-10 py-10 space-y-10 flex-1">
        {/* Navigation & Session Status Header */}
        <header className="border-b-2 border-[#0A0A0A] pb-5 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <span className="w-3 h-3 bg-[#0B8A3E] inline-block tt-pulse-dot" />
            <span className="font-serif text-3xl sm:text-4xl tracking-tight font-normal text-[#0A0A0A] group-hover:text-[#0B8A3E] transition-colors">
              Think Twice
            </span>
          </Link>

          <div className="flex items-center space-x-3 text-xs font-plex">
            {stage === "SESSION" && (
              <span className="text-[#0B8A3E] border-2 border-[#0B8A3E] px-3 py-1 font-bold shadow-[1px_1px_0px_#0B8A3E]">
                SESSION ACTIVE
              </span>
            )}
            {stage === "FINISHED" && (
              <span className="text-[#0A0A0A] border-2 border-[#0A0A0A] px-3 py-1 font-bold shadow-[1px_1px_0px_#0A0A0A]">
                DOSSIER SYNTHESIZED
              </span>
            )}
            <button
              type="button"
              onClick={handleResetCurrentStep}
              className="tt-btn-secondary px-3.5 py-1.5 font-plex text-xs uppercase tracking-wider font-bold"
              title="Reset current step inputs or notices"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleNewSession}
              className="tt-btn-primary px-4 py-1.5 font-plex text-xs uppercase tracking-wider font-bold shadow-[2px_2px_0px_#0B8A3E]"
              title="Start a new session from scratch"
            >
              New Session
            </button>
          </div>
        </header>

        {/* Loading overlay / spinner */}
        {isLoading && <LoadingStates label={loadingLabel} />}

        {/* STAGE 1: Decision Input */}
        {!isLoading && stage === "INPUT" && (
          <div className="max-w-[860px] mx-auto">
            <DecisionInput
              onSubmit={handleStartAnalysis}
              isLoading={isLoading}
              errorMessage={inputError}
              clarifyingQuestion={clarifyingQuestion}
            />
          </div>
        )}

        {/* STAGE 2: Confirm Situation (Scope Contract) */}
        {!isLoading && stage === "CONFIRM" && situation && (
          <div className="max-w-[860px] mx-auto">
            <ConfirmSituation
              situation={situation}
              onConfirm={handleConfirmSituation}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* STAGE 3: Active Questioning & Interrogation with Telemetry Sidebar */}
        {!isLoading && stage === "SESSION" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 items-start">
            {/* Main Question & Answer Column */}
            <div className="lg:col-span-8 space-y-7">
              {/* Server-written reminder banner if off-topic */}
              {reminder && (
                <ReminderNote
                  message={reminder.message}
                  lastQuestion={reminder.lastQuestion}
                  strikes={reminder.strikes}
                  paused={reminder.paused}
                />
              )}

              {currentQuestion && (
                <QuestionView
                  question={currentQuestion.question}
                  category={currentQuestion.category}
                  reflection={currentQuestion.reflection}
                  needsEvidence={currentQuestion.needsEvidence}
                  evidenceQuery={currentQuestion.evidenceQuery}
                  perspectivesExplored={currentQuestion.perspectivesExplored}
                  questionCount={currentQuestion.questionCount}
                  totalCap={6}
                  onSubmitAnswer={handleSubmitAnswer}
                  isLoading={isLoading}
                  onFinishEarly={handleFinalizeSession}
                />
              )}
            </div>

            {/* Side Telemetry Dossier Panel */}
            <div className="lg:col-span-4 space-y-6">
              {situation && (
                <div className="border-2 border-[#0A0A0A] p-6 bg-[#FAFAFA] space-y-4 shadow-[3px_3px_0px_#0A0A0A]">
                  <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-2.5">
                    <span className="font-plex text-xs uppercase tracking-wider text-[#0B8A3E] font-bold">
                      ACTIVE SCOPE CONTRACT
                    </span>
                    <span className="font-plex text-xs text-[#0A0A0A] border border-[#0A0A0A] px-2 py-0.5 font-bold">
                      LOCKED
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-plex text-xs text-[#666666] uppercase block font-bold">
                      DECISION UNDER REVIEW:
                    </span>
                    <p className="font-plex text-lg leading-snug font-semibold text-[#0A0A0A]">
                      "{situation.decisionStatement}"
                    </p>
                  </div>

                  {situation.options && situation.options.length > 0 && (
                    <div className="space-y-2 border-t border-[#0A0A0A] border-dashed pt-3">
                      <span className="font-plex text-xs text-[#666666] uppercase block font-bold">
                        BOUNDED OPTIONS:
                      </span>
                      <ul className="space-y-1.5 font-plex text-xs text-[#0A0A0A] font-semibold">
                        {situation.options.map((opt, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-[#0B8A3E] font-bold">
                              [{i + 1}]
                            </span>
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {situation.inScopeTopics && situation.inScopeTopics.length > 0 && (
                    <div className="space-y-2 border-t border-[#0A0A0A] border-dashed pt-3">
                      <span className="font-plex text-xs text-[#666666] uppercase block font-bold">
                        PERMITTED IN-SCOPE TOPICS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {situation.inScopeTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="font-plex text-xs font-semibold border border-[#0A0A0A] px-2 py-0.5 bg-white"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Anti-Jailbreak Strike Defense Panel */}
              <div className="border-2 border-[#0A0A0A] p-5 bg-white space-y-2.5 shadow-[3px_3px_0px_#0A0A0A]">
                <div className="flex items-center justify-between text-xs font-plex">
                  <span className="text-[#0A0A0A] uppercase font-bold">
                    OFF-TOPIC DEFENSE SHIELD
                  </span>
                  <span className="text-[#0B8A3E] font-bold">
                    {reminder ? `STRIKE ${reminder.strikes} / 3` : "ACTIVE // 0 STRIKES"}
                  </span>
                </div>
                <p className="font-plex text-xs text-[#0A0A0A] leading-relaxed font-medium">
                  Queries outside this decision are automatically deflected with a server
                  reminder. At 3 strikes, the session pauses to prevent drift.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: Final Decision Landscape Worksheet */}
        {!isLoading && stage === "FINISHED" && landscape && (
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
