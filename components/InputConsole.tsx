"use client";

import React from "react";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

interface InputConsoleProps {
  ideaText: string;
  setIdeaText: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PRESET_IDEAS = [
  {
    label: "AI Habit Tracker with Streaks",
    content:
      "A habit tracking app that uses an AI agent to analyze missed habits, suggest adjustments to routines, and send gentle motivational streak check-ins.",
  },
  {
    label: "Spaced Flashcards App",
    content:
      "A minimal spaced repetition flashcard web app for learning technical vocabulary, featuring Leitner box scheduling and AI-generated sample sentences.",
  },
  {
    label: "Local Event Scraper",
    content:
      "A scraper dashboard that collects free tech meetups and community workshops in my city, filters out duplicates, and presents them in a clean weekly digest.",
  },
];

export function InputConsole({
  ideaText,
  setIdeaText,
  onSubmit,
  isLoading,
}: InputConsoleProps) {
  const charCount = ideaText.trim().length;
  const isValid = charCount >= 15;

  return (
    <div className="rounded-[28px] border border-borderMuted bg-panel/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
            Step 1 · Input Your Vision
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            Turn your messy concept into an execution blueprint
          </h2>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>YourDev Studio</span>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-mono">
          <Lightbulb className="w-3.5 h-3.5 text-amberAccent" />
          <span>Quick starter examples:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_IDEAS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIdeaText(preset.content)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-card hover:bg-cardHover border border-borderMuted hover:border-accent/40 text-zinc-300 hover:text-white transition-all duration-150 active:scale-95"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          rows={5}
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="Paste your raw project idea, messy notes, or user story here... (e.g., A habit tracker with AI prompts and streak reminders)"
          className="w-full rounded-2xl bg-black/40 border border-borderMuted focus:border-accent/60 focus:ring-1 focus:ring-accent/40 p-4 md:p-5 text-sm md:text-base text-zinc-100 placeholder:text-zinc-500 outline-none transition-all resize-y font-sans leading-relaxed"
        />

        {/* Monospace character counter */}
        <div className="flex items-center justify-between mt-2 px-1 text-xs font-mono">
          <span
            className={
              charCount === 0
                ? "text-zinc-500"
                : isValid
                ? "text-accent"
                : "text-amberAccent"
            }
          >
            {charCount < 15
              ? `${charCount}/15 chars minimum`
              : `${charCount} characters`}
          </span>

          <span className="text-zinc-500 hidden sm:inline">
            Zero setup required · Works instant offline
          </span>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-400 order-2 sm:order-1 text-center sm:text-left">
          Generates a 5-phase roadmap, actionable steps, stack & agent prompt.
        </p>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || isLoading}
          className={`order-1 sm:order-2 w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 ${
            !isValid || isLoading
              ? "bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-zinc-700/30"
              : "bg-accent hover:bg-accent-light text-zinc-950 font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-98"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
              <span>Drafting your blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Break it down</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
