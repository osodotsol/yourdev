"use client";

import React, { useState } from "react";
import { Sparkles, Terminal, Code2, ShieldCheck } from "lucide-react";
import { InputConsole } from "@/components/InputConsole";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { ResultsCards } from "@/components/ResultsCards";
import { Toast } from "@/components/Toast";
import { IdeaBlueprint } from "@/types/blueprint";

// Hardcoded fallback blueprint for Slice 1 kernel validation
const SAMPLE_BLUEPRINT: IdeaBlueprint = {
  projectTitle: "AI Habit Tracker with Adaptive Streaks",
  summary:
    "A privacy-first web application that tracks micro-habits, analyzes streak friction using AI heuristics, and gives gentle adaptive pacing prompts instead of punitive streak resets.",
  roadmap: [
    {
      phase: "Phase 1",
      title: "Core Habit Logger & Local Persistence",
      description:
        "Single-page UI with habit creation, daily toggle completion, streak counter, and localStorage persistence.",
    },
    {
      phase: "Phase 2",
      title: "Streak Analytics & Friction Detection",
      description:
        "Visual weekly completion matrix, streak analytics, and detection of high-risk lapse patterns.",
    },
    {
      phase: "Phase 3",
      title: "AI Adaptive Coaching Agent Integration",
      description:
        "Weekly digest prompt generation providing empathetic coaching tips and routine recovery plans.",
    },
  ],
  nextActions: [
    {
      step: 1,
      action: "Scaffold Next.js 14 project with Tailwind and TypeScript",
      detail:
        "Initialize project directory and establish base types for Habit, CompletionLog, and StreakMetrics.",
    },
    {
      step: 2,
      action: "Build the single-habit row component with toggle",
      detail:
        "Create an accessible, tactile completion button with optimistic state and micro-sound feedback.",
    },
    {
      step: 3,
      action: "Wire localStorage hook for instant offline data",
      detail:
        "Create useHabits hook that syncs habit state to browser storage without requiring an external database.",
    },
    {
      step: 4,
      action: "Test complete creation-to-completion loop",
      detail:
        "Verify adding a habit, marking complete, and refreshing page maintains exact state.",
    },
  ],
  techStack: [
    {
      category: "Frontend Framework",
      name: "Next.js 14 (App Router)",
      reason:
        "Fast single-page hydration, zero-config TypeScript, and simple deployment to Vercel.",
    },
    {
      category: "Styling & UI",
      name: "Tailwind CSS + Lucide Icons",
      reason:
        "Clean dark obsidian theme tokens with zero runtime overhead.",
    },
    {
      category: "Storage",
      name: "Browser LocalStorage / IndexedDB",
      reason:
        "Zero-friction client persistence ensuring the app works 100% offline with zero login wall.",
    },
  ],
  resources: [
    {
      type: "Official Docs",
      title: "Next.js App Router Documentation",
      url: "https://nextjs.org/docs",
    },
    {
      type: "Interactive Tutorial",
      title: "Tailwind CSS Layouts and Responsive Grids",
      url: "https://tailwindcss.com/docs",
    },
    {
      type: "Reference Guide",
      title: "Local-First Software Architecture Guide",
      url: "https://localfirstweb.dev/",
    },
  ],
  agentGuide: {
    workflowTips: [
      "Always ask your coding agent to implement one small verifiable slice at a time.",
      "Never allow the agent to edit more than 2 files per prompt before verifying the change.",
      "Keep types strictly defined in a dedicated types/ file so the agent adheres to strict boundaries.",
      "When a bug occurs, paste the terminal error directly into the agent prompt with the exact line number.",
    ],
    firstPrompt: `I am building an AI Habit Tracker with adaptive streaks using Next.js 14 and Tailwind CSS.

Here is my first milestone:
Create a single-page habit dashboard with:
1. An input bar to create a new habit (title, category icon).
2. A list of active habits with a checkmark toggle for today.
3. A streak counter showing current continuous streak days.
4. Client persistence using browser localStorage.

Please write clean, self-contained TypeScript components. Do not install external UI libraries. Start by defining the Habit interface in types/habit.ts.`,
  },
  isFallback: true,
};

export default function Home() {
  const [ideaText, setIdeaText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<IdeaBlueprint | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  const handleBreakdown = () => {
    if (ideaText.trim().length < 15) return;
    setIsLoading(true);

    // Simulate 1.2s loading to verify shimmering skeleton UX
    setTimeout(() => {
      setBlueprint(SAMPLE_BLUEPRINT);
      setIsLoading(false);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }, 1200);
  };

  const handleReset = () => {
    setBlueprint(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-canvas text-zinc-100 flex flex-col justify-between selection:bg-accent/20 selection:text-accent relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-accent/5 via-accent/[0.01] to-transparent blur-3xl opacity-70" />
      </div>

      <div className="relative z-10">
        {/* Top Navigation */}
        <header className="border-b border-borderMuted bg-canvas/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shadow-sm shadow-accent/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Idea Breakdown Coach
                </span>
                <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                  v0.1.0-poc
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <a
                href="/devpost/spec.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-accent transition-colors flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Technical Spec</span>
              </a>
              <div className="h-3 w-px bg-zinc-800" />
              <div className="flex items-center gap-1.5 text-accent">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Fail Demo Engine</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
            <Terminal className="w-3 h-3" />
            <span>AI Coding Agent Companion</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Turn your messy idea into an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-300 to-accent-light">
              AI-ready blueprint
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t get overwhelmed by open-ended prompts. Paste your vision, get
            a structured 5-part execution roadmap, and copy the exact first prompt
            for your coding agent.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-10">
          {/* Input Console */}
          <InputConsole
            ideaText={ideaText}
            setIdeaText={setIdeaText}
            onSubmit={handleBreakdown}
            isLoading={isLoading}
          />

          {/* Dynamic Results Area */}
          {isLoading && <SkeletonLoader />}

          {!isLoading && blueprint && (
            <ResultsCards
              blueprint={blueprint}
              onReset={handleReset}
              onShowToast={triggerToast}
            />
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} isVisible={showToast} />

      {/* Minimalist Footer */}
      <footer className="border-t border-borderMuted bg-panel/50 backdrop-blur-sm py-6 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Built for Devpost: Build With AI Basics 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Next.js 14 + TypeScript + Tailwind</span>
            <span>·</span>
            <span className="text-accent">Zero Paid Dependencies</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
