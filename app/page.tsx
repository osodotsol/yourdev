"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { HeroSection } from "@/components/HeroSection";
import { PillarsBar } from "@/components/PillarsBar";
import { ProblemSection } from "@/components/ProblemSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ConsoleSection } from "@/components/ConsoleSection";
import { OutputSection } from "@/components/OutputSection";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { SiteFooter } from "@/components/SiteFooter";
import { IdeaBlueprint } from "@/types/blueprint";

const DEFAULT_SAMPLE_BLUEPRINT: IdeaBlueprint = {
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
      title: "Badge & Milestone Celebrations",
      description:
        "7-day streak animations, unlockable celebratory badges, and habit momentum scoring.",
    },
    {
      phase: "Phase 4",
      title: "AI Motivation Coach Integration",
      description:
        "Empathetic coaching prompt generation offering routine recovery plans after missed days.",
    },
  ],
  nextActions: [
    {
      step: 1,
      action: "Scaffold Next.js 14 project with TypeScript and Tailwind",
      detail:
        "Initialize project directory and establish base types for Habit, CompletionLog, and StreakMetrics.",
    },
    {
      step: 2,
      action: "Build mock Habit card component with interactive checkmark pill",
      detail:
        "Create an accessible, tactile completion button with optimistic state and micro-sound feedback.",
    },
    {
      step: 3,
      action: "Implement add habit form with local state",
      detail:
        "Allow typing a habit name, selecting an emoji category, and saving to the active list.",
    },
    {
      step: 4,
      action: "Connect browser localStorage for zero-database persistence",
      detail:
        "Verify adding a habit, marking complete, and refreshing page maintains exact state without a database.",
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
      name: "Tailwind CSS",
      reason:
        "Clean responsive utilities with zero runtime CSS overhead.",
    },
    {
      category: "Language",
      name: "TypeScript",
      reason:
        "Strict type contracts preventing silent bugs and improving AI agent pairing.",
    },
    {
      category: "Persistence",
      name: "Browser LocalStorage",
      reason:
        "Zero setup, 100% offline-first storage with no login wall.",
    },
  ],
  resources: [
    {
      type: "Official Docs",
      title: "Next.js App Router Documentation",
      url: "https://nextjs.org/docs",
    },
    {
      type: "Interactive Reference",
      title: "Tailwind CSS Layouts and Utility Reference",
      url: "https://tailwindcss.com/docs",
    },
    {
      type: "Workflow Guide",
      title: "Devpost AI Basics: Coding Agent Pair Programming",
      url: "https://devpost.com",
    },
  ],
  agentGuide: {
    workflowTips: [
      "Always ask your coding agent to implement one small verifiable slice at a time.",
      "Never allow the agent to edit more than 2 files per prompt before verifying the change.",
      "Keep types strictly defined in a dedicated types/ file so the agent adheres to strict boundaries.",
      "When a bug occurs, paste the terminal error directly into the agent prompt with the exact line number.",
    ],
    firstPrompt: `I am building an AI Habit Tracker web app using Next.js 14, TypeScript, and Tailwind CSS.

I already have the approved blueprint. Let's start with Phase 1:
1. Create a responsive single-page layout with a header.
2. Build an input bar to add a new habit with title and category.
3. Render a list of active habit cards with a streak count pill and a checkmark toggle for today.
4. Persist all habit entries and completions in browser localStorage.

Please write clean, self-contained TypeScript components with no external UI library dependencies. Start by defining the Habit interface in types/habit.ts.`,
  },
  isFallback: true,
};

export default function Home() {
  const [blueprint, setBlueprint] = useState<IdeaBlueprint | null>(
    DEFAULT_SAMPLE_BLUEPRINT
  );
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  const handleBreakdown = (text: string) => {
    setIsLoading(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let title = "AI Habit Tracker with Adaptive Streaks";
      let summary =
        "A privacy-first web application that tracks micro-habits, analyzes streak friction using AI heuristics, and gives gentle adaptive pacing prompts.";

      if (lower.includes("flashcard") || lower.includes("spaced")) {
        title = "Spaced Flashcards Learning Platform";
        summary =
          "A minimal spaced repetition flashcard web app for learning technical vocabulary with Leitner box scheduling and AI-generated sample sentences.";
      } else if (
        lower.includes("scraper") ||
        lower.includes("event") ||
        lower.includes("meetup")
      ) {
        title = "Local Developer Event Scraper & Digest";
        summary =
          "An automated scraper dashboard collecting community tech meetups and workshops, filtering duplicates, and generating weekly digests.";
      }

      setBlueprint({
        ...DEFAULT_SAMPLE_BLUEPRINT,
        projectTitle: title,
        summary: summary,
      });
      setIsLoading(false);
      triggerToast("✓ BLUEPRINT GENERATED");

      const consoleEl = document.getElementById("console");
      if (consoleEl) {
        consoleEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 900);
  };

  const handleClear = () => {
    setBlueprint(null);
  };

  return (
    <main className="min-h-screen relative">
      <div className="app-backdrop" />

      {/* Floating Pill Nav */}
      <TopNav />

      {/* Main Container */}
      <div className="page-container">
        {/* Hero Section */}
        <HeroSection />

        {/* 4-Feature Strip */}
        <PillarsBar />

        {/* 01 / The Problem */}
        <ProblemSection />

        {/* 02 / How It Works */}
        <HowItWorksSection />

        {/* 03 / Live Interactive Console */}
        <ConsoleSection
          blueprint={blueprint}
          isLoading={isLoading}
          onBreakdown={handleBreakdown}
          onClear={handleClear}
          onShowToast={triggerToast}
        />

        {/* 04 / The Output Specification (#output) */}
        <OutputSection />

        {/* 05 / Technical Architecture */}
        <ArchitectureSection />
      </div>

      {/* Dark Craft Footer */}
      <SiteFooter />

      {/* Toast Notification */}
      <div className={`craft-toast ${showToast ? "show" : ""}`}>
        {toastMessage}
      </div>
    </main>
  );
}
