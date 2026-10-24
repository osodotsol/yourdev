"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Flame,
  Laptop,
  Smartphone,
  Code2,
  Terminal,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  HabitItem,
  StudioVerificationReport,
  calculateDailyProgress,
  runStudioVerification,
} from "@/lib/studioDemoVerification";

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: "habit-1",
    title: "Drink 2L fresh water",
    category: "Health",
    completed: true,
    streak: 5,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "habit-2",
    title: "Read 20 pages of architecture book",
    category: "Focus",
    completed: false,
    streak: 2,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "habit-3",
    title: "10-minute morning mindfulness stretch",
    category: "Fitness",
    completed: true,
    streak: 7,
    createdAt: Date.now() - 86400000 * 7,
  },
];

const LOCAL_STORAGE_KEY = "yourdev_studio_demo_habits";
const IMPROVEMENT_STORAGE_KEY = "yourdev_studio_demo_improvement_applied";

type CategoryType = "Health" | "Focus" | "Mindset" | "Fitness";

export default function StudioDemoPage() {
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [isImprovementApplied, setIsImprovementApplied] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<CategoryType>("Health");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [showCodeDiff, setShowCodeDiff] = useState(false);
  const [showMilestone3, setShowMilestone3] = useState(false);
  const [verificationReport, setVerificationReport] =
    useState<StudioVerificationReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Optional AI mentor state
  const [mentorQuestion, setMentorQuestion] = useState(
    "How does deriving progress from the habit list prevent state synchronization bugs?"
  );
  const [mentorAnswer, setMentorAnswer] = useState<string | null>(null);
  const [isAskingMentor, setIsAskingMentor] = useState(false);

  // Load persisted demo habits on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedHabits = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedHabits) {
        const parsed = JSON.parse(savedHabits);
        if (Array.isArray(parsed)) {
          setHabits(parsed);
        }
      }
      const savedImprovement = localStorage.getItem(IMPROVEMENT_STORAGE_KEY);
      if (savedImprovement !== null) {
        setIsImprovementApplied(savedImprovement === "true");
      }
    } catch {
      // Local storage fallback
    }
  }, []);

  // Save changes to localStorage
  const saveHabits = (updated: HabitItem[]) => {
    setHabits(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage unavailable
    }
  };

  const toggleImprovement = () => {
    const nextState = !isImprovementApplied;
    setIsImprovementApplied(nextState);
    try {
      localStorage.setItem(IMPROVEMENT_STORAGE_KEY, String(nextState));
    } catch {
      // Storage unavailable
    }
    // Invalidate prior verification report to encourage re-running tests against the new state
    setVerificationReport(null);
  };

  const handleToggleHabit = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const nextCompleted = !h.completed;
        return {
          ...h,
          completed: nextCompleted,
          streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: HabitItem = {
      id: `habit-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      streak: 0,
      createdAt: Date.now(),
    };

    const updated = [newHabit, ...habits];
    saveHabits(updated);
    setNewTitle("");
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    saveHabits(updated);
  };

  const handleResetDefaults = () => {
    saveHabits(DEFAULT_HABITS);
    setIsImprovementApplied(false);
    setShowMilestone3(false);
    try {
      localStorage.setItem(IMPROVEMENT_STORAGE_KEY, "false");
    } catch {
      // Storage unavailable
    }
    setVerificationReport(null);
  };

  // Run deterministic verification against actual rendered DOM state
  const handleRunVerification = () => {
    setIsVerifying(true);
    // Brief animation delay so user observes evaluation transition
    setTimeout(() => {
      const report = runStudioVerification(habits, isImprovementApplied);
      setVerificationReport(report);
      setIsVerifying(false);
    }, 250);
  };

  // Optional AI Mentor review integration via existing /api/review
  const handleAskMentor = async () => {
    if (!mentorQuestion.trim()) return;
    setIsAskingMentor(true);
    setMentorAnswer(null);

    try {
      const milestonePayload = {
        id: "milestone-2-completion-indicator",
        step: 2,
        title: "Daily Completion Indicator",
        goal: "Derive completed habit ratio and display a real-time progress bar",
        filesToCreate: ["components/DailyProgress.tsx"],
        keyPackages: ["react", "lucide-react"],
      };

      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: "Minimalist offline-first habit tracker web application",
          milestone: milestonePayload,
          submission: `Learner question: ${mentorQuestion.trim()}\n\nCurrent code context:\nDerived state: completedCount = habits.filter(h => h.completed).length;\nTotal: habits.length;\nProgress percentage: Math.round((completedCount / total) * 100);`,
          submissionType: "mentor_question",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.review?.feedback) {
          setMentorAnswer(data.review.feedback);
        } else {
          setMentorAnswer(
            "Derived state keeps your UI honest: when you calculate progress directly from `habits` on each render rather than storing a secondary `progressPercent` variable, you mathematically eliminate out-of-sync bugs."
          );
        }
      } else {
        setMentorAnswer(
          "Derived state keeps your UI honest: when you calculate progress directly from `habits` on each render rather than storing a secondary `progressPercent` variable, you mathematically eliminate out-of-sync bugs."
        );
      }
    } catch {
      setMentorAnswer(
        "By deriving completion stats directly from the source array during render, you avoid having two competing sources of truth in state."
      );
    } finally {
      setIsAskingMentor(false);
    }
  };

  const progressMetrics = useMemo(
    () => calculateDailyProgress(habits),
    [habits]
  );

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1c1a17] font-sans">
      {/* Studio Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#ffffff] border-b border-[rgba(28,26,23,0.1)] px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#66635c] hover:text-[#1c1a17] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>yourdev Hub</span>
          </Link>
          <span className="text-[#8a867c]">/</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[#1c1a17]">
              Habit Tracker Build Studio
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Prototype
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#66635c] hover:text-[#1c1a17] bg-[#efece5] hover:bg-[#eae6dc] rounded-md transition-colors"
            title="Reset demonstration habits and toggle states"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="hidden sm:flex items-center border border-[rgba(28,26,23,0.12)] rounded-lg p-0.5 bg-[#f7f5f0]">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium transition-all ${
                viewportMode === "desktop"
                  ? "bg-white text-[#1c1a17] shadow-xs"
                  : "text-[#66635c] hover:text-[#1c1a17]"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium transition-all ${
                viewportMode === "mobile"
                  ? "bg-white text-[#1c1a17] shadow-xs"
                  : "text-[#66635c] hover:text-[#1c1a17]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Coordinated Three-Panel Workspace */}
      <main className="max-w-[1720px] mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* AREA 1: PROGRESS RAIL (Left Column)                       */}
          {/* ========================================================= */}
          <aside className="lg:col-span-3 bg-white border border-[rgba(28,26,23,0.1)] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(28,26,23,0.08)] mb-5">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-emerald-800">
                  Build Milestones
                </p>
                <h2 className="text-base font-semibold tracking-tight text-[#1c1a17] mt-0.5">
                  Habit Tracker Project
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#f3f0e8] text-[#66635c]">
                25% Done
              </span>
            </div>

            {/* Milestone List */}
            <div className="space-y-4">
              {/* Milestone 1: Completed */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 relative">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-semibold text-emerald-800">
                        Step 01
                      </span>
                      <span className="text-[9px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                        Verified
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1c1a17] mt-0.5">
                      Scaffold & Local Storage
                    </h3>
                    <p className="text-xs text-[#66635c] mt-1 leading-relaxed">
                      Habit list model, add/delete routines, and browser localStorage synchronization.
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestone 2: ACTIVE (Current Step) */}
              <div className="p-3.5 rounded-xl border-2 border-[#18191a] bg-white shadow-xs relative">
                <div className="absolute -top-2.5 right-3 bg-[#18191a] text-white text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full">
                  Current Step
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#18191a] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-semibold text-[#66635c]">
                        Step 02
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        In Progress
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1c1a17] mt-0.5">
                      Daily Completion Indicator
                    </h3>
                    <p className="text-xs text-[#66635c] mt-1 leading-relaxed">
                      Compute completed ratio dynamically and render visual progress percentage.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-[rgba(28,26,23,0.06)] flex items-center justify-between text-[11px]">
                      <span className="text-[#8a867c] font-medium">Target file:</span>
                      <code className="font-mono text-[#1c1a17] font-semibold">
                        DailyProgress.tsx
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestone 3: Upcoming */}
              <div className="p-3.5 rounded-xl border border-[rgba(28,26,23,0.08)] bg-[#faf9f6] opacity-80">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#efece5] text-[#8a867c] flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#8a867c]">
                      Step 03 · Up Next
                    </span>
                    <h3 className="text-sm font-medium text-[#66635c] mt-0.5">
                      Streak Engine & Grace Days
                    </h3>
                    <p className="text-xs text-[#8a867c] mt-1 leading-relaxed">
                      Calculate consecutive-day momentum and forgiving weekend pause rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestone 4: Upcoming */}
              <div className="p-3.5 rounded-xl border border-[rgba(28,26,23,0.08)] bg-[#faf9f6] opacity-80">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#efece5] text-[#8a867c] flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5">
                    4
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-[#8a867c]">
                      Step 04 · Queued
                    </span>
                    <h3 className="text-sm font-medium text-[#66635c] mt-0.5">
                      Tactile Haptics & Export
                    </h3>
                    <p className="text-xs text-[#8a867c] mt-1 leading-relaxed">
                      100% celebration effects and one-click JSON backup export.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pedagogical Note */}
            <div className="mt-6 pt-4 border-t border-[rgba(28,26,23,0.08)] text-xs text-[#66635c] leading-relaxed">
              <span className="font-semibold text-[#1c1a17] block mb-1">
                Why this sequence?
              </span>
              Building step-by-step prevents the blank-canvas trap. Test each milestone interactively before advancing.
            </div>
          </aside>

          {/* ========================================================= */}
          {/* AREA 2: MAIN PREVIEW (Real, Live Interactive Habit App)  */}
          {/* ========================================================= */}
          <section className="lg:col-span-5 flex flex-col items-center">
            {/* Viewport Canvas Container */}
            <div
              className={`w-full transition-all duration-300 ${
                viewportMode === "mobile" ? "max-w-[420px]" : "max-w-full"
              }`}
            >
              {/* Browser Window Frame Header */}
              <div className="bg-[#18191a] text-white rounded-t-2xl px-4 py-2.5 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="font-mono text-[11px] text-[#8a867c] ml-2">
                    HabitPulse v0.2.0 · Live Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Interactive
                  </span>
                </div>
              </div>

              {/* Working Application Viewport */}
              <div className="bg-white border-x border-b border-[rgba(28,26,23,0.12)] rounded-b-2xl p-5 sm:p-6 shadow-sm min-h-[580px] flex flex-col justify-between">
                <div>
                  {/* Habit App Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-[rgba(28,26,23,0.08)] mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-[#1c1a17]">
                          HabitPulse
                        </h1>
                        <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-[#f3f0e8] text-[#66635c]">
                          Offline First
                        </span>
                      </div>
                      <p className="text-xs text-[#66635c] mt-0.5">
                        Track daily rituals and maintain momentum.
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-[#8a867c] block">
                        Today
                      </span>
                      <span className="text-xs font-semibold text-[#1c1a17]">
                        {new Date().toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* TARGET IMPROVEMENT COMPONENT (Daily Progress)     */}
                  {/* -------------------------------------------------- */}
                  {isImprovementApplied ? (
                    /* ENHANCED STATE: Improvement applied */
                    <div
                      id="studio-daily-progress-container"
                      data-testid="studio-daily-progress-widget"
                      data-mounted="true"
                      data-completed={progressMetrics.completed}
                      data-total={progressMetrics.total}
                      data-percentage={progressMetrics.percentage}
                      className="mb-6 p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-[#ffffff] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-900">
                            Today&apos;s Progress
                          </span>
                          {progressMetrics.isAllCompleted && (
                            <span
                              id="studio-completion-badge"
                              data-testid="studio-completion-badge"
                              className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full animate-bounce"
                            >
                              100% Done
                            </span>
                          )}
                        </div>
                        <span
                          id="studio-progress-fraction"
                          data-testid="studio-progress-fraction"
                          className="text-xs font-mono font-bold text-emerald-800"
                        >
                          {progressMetrics.fractionalText}
                        </span>
                      </div>

                      {/* Progress Bar Track */}
                      <div
                        id="studio-progress-bar-track"
                        data-testid="studio-progress-bar-track"
                        className="w-full bg-emerald-100/80 h-3 rounded-full overflow-hidden p-0.5 border border-emerald-200/60"
                      >
                        <div
                          id="studio-progress-fill"
                          data-testid="studio-progress-fill"
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressMetrics.percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[11px]">
                        <span
                          id="studio-progress-message"
                          data-testid="studio-progress-message"
                          className="text-[#66635c] italic"
                        >
                          {progressMetrics.motivationMessage}
                        </span>
                        <span
                          id="studio-progress-percentage"
                          data-testid="studio-progress-percentage"
                          className="font-mono font-bold text-[#1c1a17]"
                        >
                          {progressMetrics.percentage}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* BASELINE STATE: Improvement unapplied */
                    <div
                      id="studio-baseline-placeholder"
                      data-testid="studio-baseline-placeholder"
                      className="mb-6 p-4 rounded-xl border border-dashed border-[rgba(28,26,23,0.18)] bg-[#faf9f6] text-center"
                    >
                      <p className="text-xs font-semibold text-[#1c1a17]">
                        Daily completion indicator is not yet mounted.
                      </p>
                      <p className="text-[11px] text-[#66635c] mt-0.5 mb-2.5">
                        Baseline view displays active habits without progress computation.
                      </p>
                      <button
                        type="button"
                        onClick={toggleImprovement}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18191a] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Apply Improvement to Mount Widget</span>
                      </button>
                    </div>
                  )}

                  {/* Add New Habit Form */}
                  <form onSubmit={handleAddHabit} className="mb-5 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a new ritual (e.g. Read 15 mins)..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[rgba(28,26,23,0.16)] focus:outline-hidden focus:border-[#18191a] bg-white transition-colors"
                    />
                    <select
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(e.target.value as CategoryType)
                      }
                      className="text-xs px-2.5 py-2 rounded-lg border border-[rgba(28,26,23,0.16)] bg-white text-[#66635c]"
                    >
                      <option value="Health">Health</option>
                      <option value="Focus">Focus</option>
                      <option value="Mindset">Mindset</option>
                      <option value="Fitness">Fitness</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!newTitle.trim()}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-[#18191a] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Habit Items List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8a867c] px-1 pb-1">
                      <span>RITUALS ({habits.length})</span>
                      <span>STATUS</span>
                    </div>

                    {habits.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-[rgba(28,26,23,0.14)] rounded-xl bg-[#faf9f6]">
                        <p className="text-xs font-medium text-[#66635c]">
                          No active habits right now.
                        </p>
                        <button
                          onClick={handleResetDefaults}
                          className="mt-2 text-xs font-semibold text-emerald-800 hover:underline"
                        >
                          Load demonstration habits
                        </button>
                      </div>
                    ) : (
                      habits.map((habit) => (
                        <div
                          key={habit.id}
                          className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                            habit.completed
                              ? "bg-[#fbfaf8] border-emerald-200/80 text-[#8a867c]"
                              : "bg-white border-[rgba(28,26,23,0.1)] text-[#1c1a17] hover:border-[rgba(28,26,23,0.2)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Interactive Checkbox */}
                            <button
                              type="button"
                              onClick={() => handleToggleHabit(habit.id)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                habit.completed
                                  ? "bg-emerald-600 text-white border border-emerald-600"
                                  : "border-2 border-[rgba(28,26,23,0.25)] hover:border-[#18191a] bg-white"
                              }`}
                              aria-label={`Toggle habit: ${habit.title}`}
                            >
                              {habit.completed && <Check className="w-3.5 h-3.5" />}
                            </button>

                            <div>
                              <p
                                className={`text-xs font-medium transition-all ${
                                  habit.completed ? "line-through text-[#8a867c]" : ""
                                }`}
                              >
                                {habit.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#f3f0e8] text-[#66635c]">
                                  {habit.category}
                                </span>
                                {habit.streak > 0 && (
                                  <span className="text-[10px] font-mono text-amber-700 font-semibold inline-flex items-center gap-0.5">
                                    <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                    {habit.streak}d streak
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#8a867c] hover:text-rose-600 transition-opacity"
                            title="Delete habit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Preview Footer Diagnostics */}
                <div className="pt-4 mt-6 border-t border-[rgba(28,26,23,0.08)] flex items-center justify-between text-[11px] font-mono text-[#8a867c]">
                  <span>Key: {LOCAL_STORAGE_KEY}</span>
                  <span className="text-emerald-700">● Local State Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* AREA 3: MENTOR & VERIFICATION PANEL (Right Column)        */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 space-y-5">
            {/* 1. Step Explanation Card */}
            <div className="bg-white border border-[rgba(28,26,23,0.1)] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(28,26,23,0.08)] mb-3">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#66635c]">
                  Concept & Task Guide
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  Beginner Friendly
                </span>
              </div>

              <h2 className="text-base font-bold tracking-tight text-[#1c1a17]">
                Milestone 2: Daily Completion Indicator
              </h2>

              <p className="text-xs text-[#66635c] mt-2 leading-relaxed">
                Checkboxes alone don&apos;t motivate users. A completion indicator converts a static checklist into a motivating progress loop.
              </p>

              {/* Three Architectural Invariants */}
              <div className="mt-3.5 space-y-2 text-xs bg-[#fbfaf8] border border-[rgba(28,26,23,0.08)] rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#18191a] text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-[#1c1a17]">Derived State:</strong> Calculate <code className="font-mono text-[11px]">completed / total</code> during render to prevent state desynchronization.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#18191a] text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-[#1c1a17]">Zero-Division Guard:</strong> When 0 habits exist, guard against <code className="font-mono text-[11px]">0 / 0 = NaN</code>.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#18191a] text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-[#1c1a17]">Visual Feedback:</strong> Scale the progress bar percentage smoothly from 0% to 100%.
                  </div>
                </div>
              </div>

              {/* Honest Implementation Notice */}
              <div className="mt-3 text-[11px] font-mono text-[#66635c] bg-[#faf9f6] p-2.5 rounded-lg border border-[rgba(28,26,23,0.08)]">
                <div className="flex items-center gap-1.5 font-semibold text-[#1c1a17] mb-0.5">
                  <Info className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Predefined Component Implementation</span>
                </div>
                This prototype applies a verified <code className="text-[#1c1a17]">DailyProgress.tsx</code> component to demonstrate the verification workflow. Arbitrary code is not executed on the server.
              </div>

              {/* Improvement Toggle Action */}
              <div className="mt-4 pt-3.5 border-t border-[rgba(28,26,23,0.08)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-semibold text-[#8a867c] block">
                    Improvement State
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      isImprovementApplied ? "text-emerald-700" : "text-[#66635c]"
                    }`}
                  >
                    {isImprovementApplied ? "APPLIED IN PREVIEW" : "BASELINE (NOT APPLIED)"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleImprovement}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isImprovementApplied
                      ? "bg-[#f3f0e8] text-[#1c1a17] hover:bg-[#eae6dc]"
                      : "bg-[#18191a] text-white hover:bg-black shadow-xs"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isImprovementApplied ? "Revert to Baseline" : "Apply Improvement"}
                  </span>
                </button>
              </div>

              {/* Code Diff Drawer Toggle */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowCodeDiff(!showCodeDiff)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#66635c] hover:text-[#1c1a17]"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showCodeDiff ? "Hide Code Change" : "View Code Change Diff"}</span>
                </button>

                {showCodeDiff && (
                  <pre className="mt-2 p-3 bg-[#0f1011] text-[#e5e7eb] rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-[#2d3033]">
                    <code>{`// components/DailyProgress.tsx
+ export function DailyProgress({ habits }) {
+   const total = habits.length;
+   const completed = habits.filter(h => h.completed).length;
+   // Guard zero division
+   const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
+   
+   return (
+     <div id="studio-daily-progress-container" className="progress-card">
+       <span id="studio-progress-fraction">{completed} of {total} habits completed today</span>
+       <div className="progress-bar-track">
+         <div id="studio-progress-fill" style={{ width: \`\${percentage}%\` }} />
+       </div>
+       <span id="studio-progress-percentage">{percentage}%</span>
+     </div>
+   );
+ }`}</code>
                  </pre>
                )}
              </div>
            </div>

            {/* 2. Deterministic Verification Card */}
            <div className="bg-white border border-[rgba(28,26,23,0.1)] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(28,26,23,0.08)] mb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#1c1a17]">
                    Deterministic Verification
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase font-semibold text-[#8a867c]">
                  4 Checks
                </span>
              </div>

              <p className="text-xs text-[#66635c] leading-relaxed">
                Inspects actual rendered interface elements (#studio-daily-progress-container), checks visible count accuracy, percentage scaling, and empty-state safety.
              </p>

              {/* Run Verification Button */}
              <button
                type="button"
                onClick={handleRunVerification}
                disabled={isVerifying}
                className="w-full mt-3.5 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18191a] text-white rounded-xl text-xs font-semibold hover:bg-black transition-all disabled:opacity-50 shadow-xs"
              >
                {isVerifying ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Inspecting rendered interface...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Verification Checks</span>
                  </>
                )}
              </button>

              {/* Verification Results Display */}
              {verificationReport && (
                <div className="mt-4 space-y-3 pt-3 border-t border-[rgba(28,26,23,0.08)]">
                  {/* Overall Banner */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col gap-2 text-xs ${
                      verificationReport.overallPassed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {verificationReport.overallPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-semibold">
                          {verificationReport.overallPassed
                            ? "✓ All 4 Requirements Satisfied"
                            : `${verificationReport.failedChecks} Check(s) Need Attention`}
                        </strong>
                        <span className="text-[11px] mt-0.5 block opacity-90">
                          {verificationReport.nextRecommendedAction}
                        </span>
                      </div>
                    </div>

                    {/* Actionable Button inside Banner */}
                    {!verificationReport.overallPassed && !isImprovementApplied && (
                      <button
                        type="button"
                        onClick={() => {
                          toggleImprovement();
                          setTimeout(handleRunVerification, 150);
                        }}
                        className="self-start mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18191a] text-white text-xs font-semibold rounded-lg hover:bg-black transition-all shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply Improvement & Re-verify</span>
                      </button>
                    )}

                    {verificationReport.overallPassed && (
                      <button
                        type="button"
                        onClick={() => setShowMilestone3(!showMilestone3)}
                        className="self-start mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition-all shadow-xs"
                      >
                        <span>Preview Milestone 3: Streak Engine</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Milestone 3 Preview Drawer */}
                  {showMilestone3 && (
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-300 shadow-xs text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-800">
                          Milestone 3 Preview
                        </span>
                        <span className="text-[10px] font-mono text-[#8a867c]">Next Blueprint Step</span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#1c1a17]">Streak Momentum Engine</h4>
                      <p className="text-xs text-[#66635c] leading-relaxed">
                        In Milestone 3, we add date-based streak calculations: compare `lastCompletedDate` with today to award consecutive streaks or activate a 1-day weekend grace buffer.
                      </p>
                    </div>
                  )}

                  {/* Itemized Checks */}
                  <div className="space-y-2">
                    {verificationReport.checks.map((check) => (
                      <div
                        key={check.id}
                        className={`p-2.5 rounded-lg border text-xs ${
                          check.passed
                            ? "bg-white border-emerald-200/80"
                            : "bg-rose-50/40 border-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1c1a17]">
                            {check.passed ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span>{check.title}</span>
                          </div>
                          <span
                            className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                              check.passed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {check.passed ? "Passed" : "Failed"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#66635c] mt-1">
                          {check.diagnostic}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Live DOM Inspection Audit Box */}
                  <div className="mt-3 p-2.5 rounded-lg bg-[#faf9f6] border border-[rgba(28,26,23,0.08)] text-[10px] font-mono text-[#66635c] space-y-1">
                    <div className="font-semibold text-[#1c1a17] uppercase tracking-wider">
                      DOM Inspection Audit:
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      <span>
                        Widget in DOM:{" "}
                        <strong className="text-[#1c1a17]">
                          {verificationReport.inspectionSummary.containerFound
                            ? "YES (#studio-daily-progress-container)"
                            : "NO"}
                        </strong>
                      </span>
                      <span>
                        Visible Fraction:{" "}
                        <strong className="text-[#1c1a17]">
                          {verificationReport.inspectionSummary.renderedCompleted !== null
                            ? `${verificationReport.inspectionSummary.renderedCompleted}/${verificationReport.inspectionSummary.renderedTotal}`
                            : "N/A"}
                        </strong>
                      </span>
                      <span>
                        Visible Percentage:{" "}
                        <strong className="text-[#1c1a17]">
                          {verificationReport.inspectionSummary.renderedPercentage !== null
                            ? `${verificationReport.inspectionSummary.renderedPercentage}%`
                            : "N/A"}
                        </strong>
                      </span>
                      <span>
                        Progress Fill Width:{" "}
                        <strong className="text-[#1c1a17]">
                          {verificationReport.inspectionSummary.renderedFillWidth || "N/A"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Optional AI Mentor Q&A (Honest API Integration) */}
            <div className="bg-white border border-[rgba(28,26,23,0.1)] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(28,26,23,0.08)] mb-3">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#66635c]">
                  Ask AI Mentor (Optional)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Gemini Pair Coach
                </span>
              </div>

              <p className="text-xs text-[#66635c] leading-relaxed mb-3">
                Have a question about this milestone? Query the mentor engine directly:
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={mentorQuestion}
                  onChange={(e) => setMentorQuestion(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[rgba(28,26,23,0.16)] focus:outline-hidden focus:border-[#18191a] bg-white"
                  placeholder="Ask a technical question about Milestone 2..."
                />
                <button
                  type="button"
                  onClick={handleAskMentor}
                  disabled={isAskingMentor || !mentorQuestion.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#f3f0e8] hover:bg-[#eae6dc] text-[#1c1a17] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isAskingMentor ? (
                    <span>Consulting mentor...</span>
                  ) : (
                    <>
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Ask Mentor</span>
                    </>
                  )}
                </button>
              </div>

              {mentorAnswer && (
                <div className="mt-3 p-3 rounded-xl bg-[#faf9f6] border border-[rgba(28,26,23,0.1)] text-xs text-[#1c1a17] leading-relaxed">
                  <span className="font-semibold block text-[11px] font-mono uppercase tracking-wider text-emerald-800 mb-1">
                    Mentor Insight
                  </span>
                  {mentorAnswer}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
