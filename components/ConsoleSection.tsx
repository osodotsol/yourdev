"use client";

import React, { useState, useEffect } from "react";
import {
  IdeaBlueprint,
  ClarifyingQuestion,
  StepReviewResult,
  FoundationModule,
} from "@/types/blueprint";
import { formatBlueprintMarkdown } from "@/lib/clipboard";
import { getClarifyingQuestions } from "@/lib/fallbackGenerator";
import { saveSession, loadSession, clearSession } from "@/lib/persistence";
import {
  Check,
  Copy,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
  Map,
  Layers,
  Terminal,
  BookOpen,
  Compass,
  ChevronDown,
  ChevronRight,
  Rocket,
  PlayCircle,
  ExternalLink,
  GraduationCap,
  Video,
  Github,
  CheckCircle2,
} from "lucide-react";
import { RoadmapGraph } from "@/components/RoadmapGraph";
import {
  isMilestoneCompletionAllowed,
  sanitizeCompletedNodeIds,
} from "@/lib/milestoneCompletion";

interface ConsoleSectionProps {
  blueprint: IdeaBlueprint | null;
  isLoading: boolean;
  onBreakdown: (text: string, choices?: Record<string, string>) => void;
  onClear: () => void;
  onShowToast: (msg: string) => void;
}

const PRESETS = {
  habit:
    "I want to build a simple habit tracker with AI that helps me stay consistent, gives me daily reminders, and awards fun badges when I hit a 7-day streak.",
  flashcards:
    "A minimal spaced repetition flashcard web app for learning technical vocabulary, featuring Leitner box scheduling and AI-generated sample sentences.",
  events:
    "A scraper dashboard that collects free tech meetups and community workshops in my city, filters out duplicates, and presents them in a clean weekly digest.",
  cliFinance:
    "A personal finance CLI tool for tracking daily expenses, setting categorical budgets, and printing an ASCII monthly spend chart in the terminal.",
};

type StudioTab =
  | "start_here"
  | "learn_first"
  | "product_map"
  | "milestones"
  | "level_up"
  | "ship_it";

export function DevSourceBadge({
  source,
}: {
  source?: "model" | "fallback" | "curated";
}) {
  if (!source) return null;
  const isModel = source === "model";
  const isCurated = source === "curated";
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        padding: "2px 7px",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        verticalAlign: "middle",
        background: isModel ? "#ecfdf5" : isCurated ? "#eff6ff" : "#fff7ed",
        color: isModel ? "#047857" : isCurated ? "#1d4ed8" : "#c2410c",
        border: `1px solid ${
          isModel ? "#a7f3d0" : isCurated ? "#bfdbfe" : "#fed7aa"
        }`,
      }}
      title={`Engine source: ${source}`}
    >
      <span style={{ fontSize: "7px" }}>●</span>
      <span>{source}</span>
    </span>
  );
}

export function ConsoleSection({
  blueprint,
  isLoading,
  onBreakdown,
  onClear,
  onShowToast,
}: ConsoleSectionProps) {
  const [inputText, setInputText] = useState("");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [questions, setQuestions] = useState<ClarifyingQuestion[] | null>(null);
  const [userChoices, setUserChoices] = useState<Record<string, string>>({});
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [completedFoundationIds, setCompletedFoundationIds] = useState<string[]>([]);
  const [vibeMode, setVibeMode] = useState<boolean>(true);
  const [savedReviews, setSavedReviews] = useState<Record<string, StepReviewResult>>({});
  const [savedArtifactReviews, setSavedArtifactReviews] = useState<Record<string, StepReviewResult>>({});
  const [savedArtifactDrafts, setSavedArtifactDrafts] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<StudioTab>("start_here");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [expandedLevelUpItems, setExpandedLevelUpItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = loadSession();
    if (saved.rawIdea && !inputText) {
      setInputText(saved.rawIdea);
    }
    if (saved.userChoices && Object.keys(saved.userChoices).length > 0) {
      setUserChoices(saved.userChoices);
      if (saved.userChoices["coding_style"] === "myself") {
        setVibeMode(false);
      }
    }
    if (saved.completedNodeIds && saved.completedNodeIds.length > 0) {
      setCompletedNodeIds(saved.completedNodeIds);
    }
    if (saved.completedFoundationIds && saved.completedFoundationIds.length > 0) {
      setCompletedFoundationIds(saved.completedFoundationIds);
    }
    if (typeof saved.vibeMode === "boolean") {
      setVibeMode(saved.vibeMode);
    }
    if (saved.reviews) {
      setSavedReviews(saved.reviews);
    }
    if (saved.artifactReviews) {
      setSavedArtifactReviews(saved.artifactReviews);
    }
    if (saved.artifactDrafts) {
      setSavedArtifactDrafts(saved.artifactDrafts);
    }
  }, []);

  useEffect(() => {
    if (blueprint?.nodes && blueprint.nodes.length > 0 && completedNodeIds.length > 0) {
      const sanitized = sanitizeCompletedNodeIds(
        completedNodeIds,
        blueprint.nodes,
        savedArtifactReviews,
        savedArtifactDrafts
      );
      if (sanitized.length !== completedNodeIds.length) {
        setCompletedNodeIds(sanitized);
        saveSession({ completedNodeIds: sanitized });
      }
    }
  }, [blueprint?.nodes, savedArtifactReviews, savedArtifactDrafts]);

  const handleToggleNode = (nodeId: string) => {
    setCompletedNodeIds((prev) => {
      const isCurrentlyCompleted = prev.includes(nodeId);
      if (!isCurrentlyCompleted) {
        const targetNode = blueprint?.nodes?.find((n) => n.id === nodeId);
        if (targetNode) {
          const eligibility = isMilestoneCompletionAllowed(
            targetNode,
            savedArtifactReviews,
            savedArtifactDrafts
          );
          if (!eligibility.allowed) {
            onShowToast(
              `⚠️ CANNOT COMPLETE MILESTONE: ${eligibility.reason || "All required starter files must pass verification."}`
            );
            return prev;
          }
        }
      }
      const updated = isCurrentlyCompleted
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId];
      saveSession({ completedNodeIds: updated });
      return updated;
    });
  };

  const handleToggleFoundation = (modId: string) => {
    setCompletedFoundationIds((prev) => {
      const updated = prev.includes(modId)
        ? prev.filter((id) => id !== modId)
        : [...prev, modId];
      saveSession({ completedFoundationIds: updated });
      return updated;
    });
  };

  const handleToggleVibeMode = (mode: boolean) => {
    setVibeMode(mode);
    saveSession({ vibeMode: mode });
  };

  const handleSaveReview = (stepId: string, review: StepReviewResult) => {
    const updated = { ...savedReviews, [stepId]: review };
    setSavedReviews(updated);
    saveSession({ reviews: updated });
  };

  const handleSaveArtifactReview = (key: string, review: StepReviewResult) => {
    const updated = { ...savedArtifactReviews, [key]: review };
    setSavedArtifactReviews(updated);
    saveSession({ artifactReviews: updated });
  };

  const handleSaveArtifactDraft = (key: string, content: string) => {
    setSavedArtifactDrafts((prev) => {
      const updated = { ...prev, [key]: content };
      saveSession({ artifactDrafts: updated });
      return updated;
    });
  };

  const loadAdaptiveQuestions = async (text: string) => {
    setIsGeneratingQuestions(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
          const defaults: Record<string, string> = { ...userChoices };
          data.questions.forEach((q: any) => {
            if (!defaults[q.id]) {
              const rec =
                q.options.find((o: any) => o.recommendation) || q.options[0];
              defaults[q.id] = rec.id;
            }
          });
          setUserChoices(defaults);
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingQuestions(false);
    }

    const qs = getClarifyingQuestions(text);
    setQuestions(qs);
    const defaults: Record<string, string> = { ...userChoices };
    qs.forEach((q) => {
      if (!defaults[q.id]) {
        const rec = q.options.find((o) => o.recommendation) || q.options[0];
        defaults[q.id] = rec.id;
      }
    });
    setUserChoices(defaults);
  };

  const handleSelectPreset = (key: keyof typeof PRESETS) => {
    const text = PRESETS[key];
    setInputText(text);
    loadAdaptiveQuestions(text);
  };

  const handleTriggerBreakdown = () => {
    if (inputText.trim().length < 15) {
      onShowToast("Please enter at least 15 characters (or click a quick preset).");
      return;
    }

    let currentChoices = { ...userChoices };
    if (!questions) {
      const qs = getClarifyingQuestions(inputText);
      setQuestions(qs);
      qs.forEach((q) => {
        if (!currentChoices[q.id]) {
          const rec = q.options.find((o) => o.recommendation) || q.options[0];
          currentChoices[q.id] = rec.id;
        }
      });
      setUserChoices(currentChoices);
    }

    setActiveTab("start_here");
    onBreakdown(inputText, currentChoices);

    setTimeout(() => {
      const el = document.getElementById("loader-indicator");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  const handleToggleCustomizer = () => {
    if (inputText.trim().length < 10) {
      onShowToast("Please type an idea first to calibrate architecture.");
      return;
    }
    if (!questions) {
      loadAdaptiveQuestions(inputText);
    }
    setShowCustomizer((prev) => !prev);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    const updated = {
      ...userChoices,
      [questionId]: optionId,
    };
    setUserChoices(updated);
    if (questionId === "coding_style") {
      setVibeMode(optionId === "vibe");
    }
    saveSession({ userChoices: updated });
  };

  const handleCopyFull = async () => {
    if (!blueprint) return;
    try {
      const markdown = formatBlueprintMarkdown(blueprint);
      await navigator.clipboard.writeText(markdown);
      onShowToast("✓ FULL STRATEGY BLUEPRINT COPIED");
    } catch {
      onShowToast("Failed to copy blueprint.");
    }
  };

  const handleCopyPrompt = async () => {
    if (!blueprint) return;
    try {
      await navigator.clipboard.writeText(blueprint.agentGuide.firstPrompt);
      onShowToast("✓ FIRST AGENT PROMPT COPIED");
    } catch {
      onShowToast("Failed to copy prompt.");
    }
  };

  const handleClearAll = () => {
    setInputText("");
    setQuestions(null);
    setUserChoices({});
    setShowCustomizer(false);
    setCompletedNodeIds([]);
    setCompletedFoundationIds([]);
    setSavedReviews({});
    clearSession();
    onClear();
  };

  const toggleLevelUp = (key: string) => {
    setExpandedLevelUpItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Foundations calculations
  const allFoundations: FoundationModule[] =
    blueprint?.foundations?.selectedModules || [];
  const visibleFoundations = allFoundations.filter((mod) => {
    if (vibeMode) {
      // In vibe mode, only show core modules + safe prompt engineering
      return mod.tier === "core" || mod.id === "foundation-6";
    }
    return mod.tier !== "later";
  });

  const foundationsDoneCount = visibleFoundations.filter((m) =>
    completedFoundationIds.includes(m.id)
  ).length;
  const foundationsPercent = Math.round(
    (foundationsDoneCount / (visibleFoundations.length || 1)) * 100
  );

  return (
    <section className="craft-section" id="console">
      <div className="section-eyebrow">03 / LIVE INTERACTIVE CONSOLE</div>

      <h2 className="section-headline">
        Break down your idea. <em>Right here.</em>
      </h2>

      <div className={`craft-console-box ${isLoading ? "is-loading" : ""}`}>
        <div className="console-meta-strip">
          <span>⚡ AI ARCHITECT & MENTOR ENGINE // yourdev</span>
          <span>BEGINNER-FIRST SPECIFICATION STUDIO</span>
        </div>

        {/* ALWAYS VISIBLE INPUT TEXTAREA */}
        <div style={{ position: "relative" }}>
          <textarea
            className="craft-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste your raw project idea here... (e.g. 'A mobile expense tracker that lets me take photos of receipts and categorizes them offline with zero cloud server')"
            rows={4}
            disabled={isLoading}
          />
        </div>

        {/* PRESET CHIPS */}
        <div className="craft-presets-row">
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-soft)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Or pick a sample preset:
          </span>
          <button
            type="button"
            className="craft-preset-chip"
            onClick={() => handleSelectPreset("habit")}
            disabled={isLoading}
          >
            + Habit Tracker
          </button>
          <button
            type="button"
            className="craft-preset-chip"
            onClick={() => handleSelectPreset("cliFinance")}
            disabled={isLoading}
          >
            + Finance CLI
          </button>
          <button
            type="button"
            className="craft-preset-chip"
            onClick={() => handleSelectPreset("flashcards")}
            disabled={isLoading}
          >
            + Flashcards
          </button>
          <button
            type="button"
            className="craft-preset-chip"
            onClick={() => handleSelectPreset("events")}
            disabled={isLoading}
          >
            + Dev Event Scraper
          </button>
        </div>

        {/* ACTIONS BAR WITH ANIMATED BUTTON */}
        <div className="console-actions-bar">
          <button
            type="button"
            className={`btn-craft-primary ${isLoading ? "is-loading" : ""}`}
            onClick={handleTriggerBreakdown}
            disabled={isLoading || inputText.trim().length < 15}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Synthesizing Foundations & Roadmap...</span>
              </>
            ) : (
              <>
                <span>Break it down with AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-craft-secondary"
            onClick={handleToggleCustomizer}
            disabled={isLoading || inputText.trim().length < 10}
            style={{ fontSize: "13px" }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {showCustomizer ? "Hide Intake Questions" : "Intake & Profile (3–4 Qs)"}
            </span>
          </button>

          {inputText && !isLoading && (
            <button
              type="button"
              className="btn-craft-secondary"
              onClick={handleClearAll}
              style={{ fontSize: "13px" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* TASK 1: ADAPTIVE INTAKE QUESTIONS */}
        {showCustomizer && questions && questions.length > 0 && (
          <div className="coaching-card-wrap" style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div className="coaching-step-badge">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length} · Tailoring Your Curriculum
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomizer(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "12px",
                  color: "var(--text-soft)",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Skip & use beginner defaults
              </button>
            </div>

            {/* Current Active Intake Question */}
            {questions[currentQuestionIndex] && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid var(--border)",
                  borderRadius: "12px",
                  padding: "18px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>
                  {questions[currentQuestionIndex].title}
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "14px",
                  }}
                >
                  {questions[currentQuestionIndex].helper}
                </p>

                <div className="coaching-options-grid">
                  {questions[currentQuestionIndex].options.map((opt) => {
                    const isSelected =
                      userChoices[questions[currentQuestionIndex].id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`coaching-option-pill ${
                          isSelected ? "is-selected" : ""
                        }`}
                        onClick={() =>
                          handleSelectOption(
                            questions[currentQuestionIndex].id,
                            opt.id
                          )
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              border: isSelected
                                ? "4px solid #fff"
                                : "1.5px solid var(--border-strong)",
                              background: isSelected ? "#18191a" : "transparent",
                            }}
                          />
                          <span>{opt.label}</span>
                        </div>
                        {opt.recommendation && (
                          <span className="coaching-rec-tag">Recommended</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    className="btn-craft-secondary"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Back
                  </button>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        className="btn-craft-primary"
                        onClick={() =>
                          setCurrentQuestionIndex((i) =>
                            Math.min(questions.length - 1, i + 1)
                          )
                        }
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-craft-primary"
                        onClick={() => {
                          setShowCustomizer(false);
                          handleTriggerBreakdown();
                        }}
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        Generate Tailored Blueprint
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANIMATED LOADING SHIMMER CARD */}
        {isLoading && (
          <div className="craft-loader-card" id="loader-indicator">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "12px",
                  color: "#92400e",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                ✦ CURATING FOUNDATIONS & CAPPING ROADMAP...
              </p>
            </div>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--text)",
                marginBottom: "14px",
                lineHeight: 1.5,
              }}
            >
              Extracting domain entities, sequencing ground-truth foundation modules,
              capping milestones to 90 minutes / 3 files, and preparing your first 20 minutes...
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  background: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                }}
              >
                ✓ Ground-Truth Foundations Bank
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  background: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                  animation: "pulse 1.2s infinite",
                }}
              >
                ✦ Size Caps Enforced (&lt;= 3 files, &lt;= 90m)
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  background: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                }}
              >
                ✦ Plain-English Product Map
              </span>
            </div>
          </div>
        )}

        {/* DYNAMIC BLUEPRINT STAGE */}
        {!isLoading && blueprint && (
          <div className="blueprint-stage" id="blueprint-results">
            <div className="blueprint-stage-head">
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className="card-kicker">
                    {blueprint.isFallback
                      ? "OFFLINE HEURISTIC BLUEPRINT"
                      : "✦ TAILORED BEGINNER BLUEPRINT"}
                  </span>
                  <DevSourceBadge
                    source={
                      blueprint.sourceBadges?.architecture ||
                      (blueprint.isFallback ? "fallback" : "model")
                    }
                  />
                </div>
                <h3 style={{ margin: "6px 0 8px" }}>{blueprint.projectTitle}</h3>
                <p
                  style={{
                    fontSize: "14.5px",
                    lineHeight: "1.55",
                    color: "var(--text-muted)",
                    maxWidth: "700px",
                  }}
                >
                  {blueprint.summary}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn-craft-secondary"
                  onClick={handleToggleCustomizer}
                  style={{ fontSize: "12px", padding: "9px 16px" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Calibrate Profile</span>
                </button>
                <button
                  type="button"
                  className="btn-craft-primary"
                  onClick={handleCopyFull}
                  style={{ fontSize: "12px", padding: "9px 18px" }}
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Plan</span>
                </button>
              </div>
            </div>

            {/* "HOW YOUR ANSWERS SHAPED THIS PLAN" CALLOUT */}
            <div
              style={{
                marginTop: "16px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#0f172a",
                  }}
                >
                  How Your Answers Shaped This Plan
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--mono)",
                    background: "#ecfdf5",
                    color: "#065f46",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  Style: {userChoices["coding_style"] === "myself" ? "Mostly Myself" : userChoices["coding_style"] === "mix" ? "Balanced Mix" : "Vibe Coding (AI-Directing)"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--mono)",
                    background: "#eff6ff",
                    color: "#1e40af",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  Level: {userChoices["experience_level"] === "intermediate" ? "Build Already" : userChoices["experience_level"] === "beginner" ? "Know A Little" : "Never Coded (Beginner-First)"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--mono)",
                    background: "#fffbeb",
                    color: "#92400e",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #fde68a",
                  }}
                >
                  Fits your time: ~8.5h required within your dedicated budget
                </span>
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  lineHeight: "1.5",
                  color: "#475569",
                  margin: 0,
                }}
              >
                {blueprint.strategyDecision}
              </p>
            </div>

            {/* TASK 5: REORDERED STUDIO NAVIGATION TABS WITH DEV SOURCE BADGES */}
            <div className="output-tabs-bar" role="tablist" style={{ marginTop: "24px" }}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "start_here"}
                className={`output-tab-btn ${
                  activeTab === "start_here" ? "is-active" : ""
                }`}
                onClick={() => setActiveTab("start_here")}
              >
                <PlayCircle className="w-4 h-4 text-amber-500" />
                <span>1. Start Here</span>
                <DevSourceBadge source={blueprint.sourceBadges?.startHere} />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "learn_first"}
                className={`output-tab-btn ${
                  activeTab === "learn_first" ? "is-active" : ""
                }`}
                onClick={() => setActiveTab("learn_first")}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>2. Learn First</span>
                <DevSourceBadge source={blueprint.sourceBadges?.foundations || "curated"} />
                {allFoundations.length > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      opacity: 0.8,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    ({visibleFoundations.length} Modules)
                  </span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "product_map"}
                className={`output-tab-btn ${
                  activeTab === "product_map" ? "is-active" : ""
                }`}
                onClick={() => setActiveTab("product_map")}
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>3. Project Map & Parts</span>
                <DevSourceBadge
                  source={
                    blueprint.sourceBadges?.architecture ||
                    blueprint.sourceBadges?.productMap ||
                    (blueprint.isFallback ? "fallback" : "model")
                  }
                />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "milestones"}
                className={`output-tab-btn ${
                  activeTab === "milestones" ? "is-active" : ""
                }`}
                onClick={() => setActiveTab("milestones")}
              >
                <Map className="w-4 h-4 text-indigo-600" />
                <span>4. Build Milestones</span>
                <DevSourceBadge source={blueprint.sourceBadges?.milestones} />
                {blueprint.nodes && (
                  <span
                    style={{
                      fontSize: "11px",
                      opacity: 0.8,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    ({blueprint.nodes.length} Steps)
                  </span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "level_up"}
                className={`output-tab-btn ${
                  activeTab === "level_up" ? "is-active" : ""
                }`}
                onClick={() => setActiveTab("level_up")}
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span>5. Level Up Later</span>
                <DevSourceBadge source={blueprint.sourceBadges?.levelUp || "fallback"} />
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "ship_it"}
                className={`output-tab-btn ${
                  activeTab === "ship_it" ? "is-active" : ""
                }`}
                onClick={() => setActiveTab("ship_it")}
              >
                <Rocket className="w-4 h-4 text-rose-500" />
                <span>6. Ship It</span>
                <DevSourceBadge
                  source={
                    blueprint.sourceBadges?.shipIt ||
                    (blueprint.isFallback ? "fallback" : "curated")
                  }
                />
              </button>
            </div>


            {/* TAB 1: START HERE ("YOUR FIRST 20 MINUTES") */}
            {activeTab === "start_here" && (
              <div style={{ marginTop: "16px" }}>
                {blueprint.first20Minutes && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "2px solid #fed7aa",
                      borderRadius: "14px",
                      padding: "24px",
                      boxShadow: "0 4px 16px rgba(245, 158, 11, 0.08)",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          background: "#fffbeb",
                          color: "#b45309",
                          border: "1px solid #fde68a",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontFamily: "var(--mono)",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        ⏱️ TOP PRIORITY // YOUR FIRST 20 MINUTES
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        margin: "0 0 8px",
                        color: "#0f172a",
                      }}
                    >
                      {blueprint.first20Minutes.action}
                    </h3>

                    <p
                      style={{
                        fontSize: "14px",
                        color: "#475569",
                        lineHeight: "1.6",
                        marginBottom: "18px",
                      }}
                    >
                      <strong>Why this comes first:</strong> {blueprint.first20Minutes.why}
                    </p>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#334155",
                          textTransform: "uppercase",
                          marginBottom: "10px",
                        }}
                      >
                        ✦ What To Do Right Now:
                      </div>
                      <ol
                        style={{
                          margin: 0,
                          paddingLeft: "20px",
                          fontSize: "13.5px",
                          lineHeight: "1.7",
                          color: "#1e293b",
                        }}
                      >
                        {blueprint.first20Minutes.whatToDo.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div
                      style={{
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div style={{ fontSize: "13px", color: "#065f46" }}>
                        <strong>Done when:</strong> {blueprint.first20Minutes.whatDoneLooksLike}
                      </div>
                    </div>
                  </div>
                )}

                {/* Master Agent Prompt Card */}
                <div className="blueprint-card-item tile-wide">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <div className="card-kicker">First Step Agent Prompt</div>
                      <h4 className="card-title" style={{ margin: 0, color: "#fff" }}>
                        Paste Into Your AI Coding Agent (Cursor / Copilot / Claude)
                      </h4>
                    </div>
                    <button
                      type="button"
                      className="btn-craft-secondary"
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        background: "#26282b",
                        color: "#fff",
                        borderColor: "#3d4044",
                      }}
                      onClick={handleCopyPrompt}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Master Prompt</span>
                    </button>
                  </div>
                  <pre className="prompt-terminal">
                    {blueprint.agentGuide.firstPrompt}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: LEARN FIRST (FOUNDATIONS PATH) */}
            {activeTab === "learn_first" && (
              <div style={{ marginTop: "16px" }}>
                {/* Header with Vibe Coder vs Go Deeper Toggle */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "16px" }}>
                      Curated Foundations Curriculum
                    </h4>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)" }}>
                      Ground-truth concepts you need <em>first</em> before writing complex logic.
                    </p>
                  </div>

                  {/* Vibe / Deeper Toggle */}
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      background: "var(--surface-alt)",
                      padding: "4px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleVibeMode(true)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: vibeMode ? "#18191a" : "transparent",
                        color: vibeMode ? "#ffffff" : "var(--text-muted)",
                      }}
                    >
                      ⚡ Vibe-Coder Minimum
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVibeMode(false)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: !vibeMode ? "#18191a" : "transparent",
                        color: !vibeMode ? "#ffffff" : "var(--text-muted)",
                      }}
                    >
                      📖 Go Deeper (Full Path)
                    </button>
                  </div>
                </div>

                {/* Foundations Progress Bar */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontFamily: "var(--mono)",
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    <span>FOUNDATIONS PROGRESS</span>
                    <strong>
                      {foundationsDoneCount}/{visibleFoundations.length} Completed ({foundationsPercent}%)
                    </strong>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e2e8f0",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${foundationsPercent}%`,
                        height: "100%",
                        background: "#10b981",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Modules Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {visibleFoundations.map((mod, idx) => {
                    const isDone = completedFoundationIds.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        style={{
                          background: "#ffffff",
                          border: isDone ? "1.5px solid #86efac" : "1.5px solid var(--border)",
                          borderRadius: "12px",
                          padding: "18px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <button
                              type="button"
                              aria-label="Toggle foundation completed"
                              className={`roadmap-checkbox ${isDone ? "is-checked" : ""}`}
                              onClick={() => handleToggleFoundation(mod.id)}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#b45309",
                                background: "#fef3c7",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              Step 0{idx + 1}
                            </span>

                            <h4 style={{ margin: 0, fontSize: "15.5px" }}>{mod.title}</h4>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontFamily: "var(--mono)",
                                color: "var(--text-soft)",
                              }}
                            >
                              ⏱️ {mod.minutes} mins
                            </span>
                            <span
                              style={{
                                fontSize: "10px",
                                fontFamily: "var(--mono)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: mod.tier === "core" ? "#ecfdf5" : "#eff6ff",
                                color: mod.tier === "core" ? "#065f46" : "#1e40af",
                              }}
                            >
                              {mod.tier.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Plain English Summary with Analogy */}
                        <p
                          style={{
                            fontSize: "13.5px",
                            lineHeight: "1.55",
                            color: "var(--text)",
                            marginBottom: "10px",
                          }}
                        >
                          {mod.plainEnglishSummary}
                        </p>

                        {/* Why for YOUR project */}
                        <div
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            fontSize: "12.5px",
                            color: "#334155",
                            marginBottom: "12px",
                          }}
                        >
                          <strong>Why for your project:</strong> {mod.whyNeededForProject || mod.plainEnglishSummary}
                        </div>

                        {/* Mode Specific Guidance */}
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            lineHeight: "1.5",
                            marginBottom: "12px",
                          }}
                        >
                          {vibeMode ? (
                            <span>
                              <strong>⚡ Vibe-Coder Minimum:</strong> {mod.vibeMinimumNote}
                            </span>
                          ) : (
                            <span>
                              <strong>📖 Deeper Context:</strong> {mod.deeperNote}
                            </span>
                          )}
                        </div>

                        {/* You're done when checks */}
                        <div
                          style={{
                            borderTop: "1px solid var(--border)",
                            paddingTop: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div style={{ fontSize: "12px", color: "#065f46" }}>
                            <strong>You're done when:</strong> {mod.youreDoneWhen.join(" · ")}
                          </div>

                          {/* Official Doc Link (Honest Labeling) */}
                          <a
                            href={mod.officialResource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "11.5px",
                              fontFamily: "var(--mono)",
                              color: "var(--accent-green)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "underline",
                            }}
                          >
                            <span>{mod.officialResource.title} (official docs)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: YOUR PROJECT, MAPPED (TASK 4) */}
            {activeTab === "product_map" && blueprint.productMap && (
              <div style={{ marginTop: "16px" }}>
                {/* 0. ARCHITECTURE & DECOMPOSITION */}
                {blueprint.architecture && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "2px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "22px",
                      marginBottom: "18px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            background: "#0f172a",
                            color: "#f8fafc",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            fontFamily: "var(--mono)",
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {blueprint.architecture.project_type === "bot"
                            ? "🤖 Bot Architecture"
                            : blueprint.architecture.project_type === "CLI"
                            ? "💻 Terminal CLI Tool"
                            : blueprint.architecture.project_type === "mobile app"
                            ? "📱 Mobile App"
                            : blueprint.architecture.project_type === "data/script"
                            ? "📊 Data Script / Scraper"
                            : blueprint.architecture.project_type === "game"
                            ? "🎮 Game Engine"
                            : "🌐 Web Application"}
                        </span>
                        <DevSourceBadge
                          source={
                            blueprint.sourceBadges?.architecture ||
                            (blueprint.isFallback ? "fallback" : "model")
                          }
                        />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                        {blueprint.architecture.parts.length} distinct project components
                      </span>
                    </div>

                    {/* Back End vs Front End Explained Simply */}
                    <div
                      style={{
                        background: "#f0fdfa",
                        border: "1.5px solid #99f6e4",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 6px",
                          fontSize: "15px",
                          color: "#0f766e",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>💡</span> Back End vs Front End (Explained Simply For This Project)
                      </h4>
                      <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.6", color: "#134e4a" }}>
                        {blueprint.architecture.front_back_explained_simply}
                      </p>
                    </div>

                    {/* Preview of Finished Product */}
                    {blueprint.architecture.finished_product_preview && (
                      <div
                        style={{
                          background: "#faf5ff",
                          border: "1.5px solid #e9d5ff",
                          borderRadius: "10px",
                          padding: "16px",
                          marginBottom: "16px",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 6px",
                            fontSize: "15px",
                            color: "#6b21a8",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>✨</span> Preview of Finished Product
                        </h4>
                        <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.6", color: "#581c87" }}>
                          {blueprint.architecture.finished_product_preview}
                        </p>
                      </div>
                    )}

                    {/* Recommended Stack & Alternatives */}
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <h4 style={{ margin: "0 0 8px", fontSize: "15px", color: "#1e293b" }}>
                        🛠️ Recommended Beginner Stack
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: "13.5px", color: "#0f172a" }}>
                          {blueprint.architecture.recommended_stack.language}
                        </span>
                        {blueprint.architecture.recommended_stack.framework_or_tools.map((tool, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              fontSize: "12px",
                              fontFamily: "var(--mono)",
                              color: "#334155",
                            }}
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.55", margin: "0 0 10px" }}>
                        <strong>Why in plain English:</strong> {blueprint.architecture.recommended_stack.why_in_plain_english}
                      </p>
                      {blueprint.architecture.recommended_stack.alternatives &&
                        blueprint.architecture.recommended_stack.alternatives.length > 0 && (
                          <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontFamily: "var(--mono)",
                                color: "#64748b",
                                textTransform: "uppercase",
                              }}
                            >
                              Beginner Alternatives:
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                              {blueprint.architecture.recommended_stack.alternatives.map((alt, i) => (
                                <div key={i} style={{ fontSize: "12px", color: "#334155" }}>
                                  • <strong>{alt.name}</strong>: <em>{alt.pick_this_if}</em>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* The 3-7 Project Parts */}
                    <div>
                      <div className="card-kicker">Component Blueprint // {blueprint.architecture.parts.length} Parts</div>
                      <h4 style={{ margin: "4px 0 14px", fontSize: "18px" }}>The Parts of Your Project</h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {blueprint.architecture.parts.map((part, idx) => {
                          const isFront = part.side.includes("front end");
                          const isBack = part.side.includes("back end");
                          return (
                            <div
                              key={part.id || idx}
                              style={{
                                background: "#ffffff",
                                border: "1.5px solid #e2e8f0",
                                borderRadius: "10px",
                                padding: "16px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                  marginBottom: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span
                                    style={{
                                      background: "#0f172a",
                                      color: "#ffffff",
                                      fontFamily: "var(--mono)",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      width: "22px",
                                      height: "22px",
                                      borderRadius: "50%",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {idx + 1}
                                  </span>
                                  <h5 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{part.name}</h5>
                                </div>

                                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      borderRadius: "4px",
                                      padding: "3px 8px",
                                      background: isFront ? "#eff6ff" : isBack ? "#fffbeb" : "#f5f3ff",
                                      color: isFront ? "#1d4ed8" : isBack ? "#b45309" : "#6d28d9",
                                      border: `1px solid ${
                                        isFront ? "#bfdbfe" : isBack ? "#fde68a" : "#ddd6fe"
                                      }`,
                                    }}
                                  >
                                    {part.side}
                                  </span>
                                  {part.depends_on && part.depends_on.length > 0 && (
                                    <span
                                      style={{
                                        fontSize: "10.5px",
                                        fontFamily: "var(--mono)",
                                        background: "#f1f5f9",
                                        color: "#475569",
                                        padding: "3px 7px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      Depends on: {part.depends_on.join(", ")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p style={{ fontSize: "13.5px", color: "var(--text)", margin: "0 0 10px", lineHeight: "1.5" }}>
                                {part.one_line_purpose}
                              </p>

                              {part.example_look_feel_function && (
                                <div
                                  style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                    marginBottom: "10px",
                                    fontSize: "12.5px",
                                    color: "#334155",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  <strong>👁️ How it looks, feels & functions:</strong> {part.example_look_feel_function}
                                </div>
                              )}

                              {part.steps && part.steps.length > 0 && (
                                <div style={{ marginBottom: "10px" }}>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      fontFamily: "var(--mono)",
                                      color: "#64748b",
                                      textTransform: "uppercase",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    Individual Build Steps:
                                  </div>
                                  <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "12.5px", color: "#1e293b", lineHeight: "1.6" }}>
                                    {part.steps.map((s, sIdx) => (
                                      <li key={sIdx}>{s}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                              {part.resources && part.resources.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                  <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "#64748b" }}>
                                    Beginner Resources:
                                  </span>
                                  {part.resources.map((r, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        background: "#ffffff",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "4px",
                                        padding: "3px 8px",
                                        fontSize: "11.5px",
                                        color: "#0369a1",
                                        textDecoration: "none",
                                      }}
                                      title={r.why}
                                    >
                                      <span>{r.title}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. What it does */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker">01 · Plain English Definition</div>

                  <h4 style={{ margin: "4px 0 8px", fontSize: "17px" }}>What It Does</h4>
                  <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: "var(--text)", margin: 0 }}>
                    {blueprint.productMap.whatItDoes}
                  </p>
                </div>

                {/* 2. User Journey */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker">02 · End-to-End User Experience</div>
                  <h4 style={{ margin: "4px 0 14px", fontSize: "17px" }}>User Journey</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {blueprint.productMap.userJourney.map((stepStr, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          background: "var(--surface-alt)",
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: "#18191a",
                            color: "#fff",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div style={{ flex: 1, fontSize: "13px", color: "var(--text)" }}>
                          {stepStr}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Screens & Core Data */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {/* Screens */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid var(--border)",
                      borderRadius: "12px",
                      padding: "18px",
                    }}
                  >
                    <div className="card-kicker">03 · UI Boundaries</div>
                    <h4 style={{ margin: "4px 0 12px", fontSize: "16px" }}>Screens</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {blueprint.productMap.screens.map((screen, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "8px 12px",
                            background: "var(--surface-alt)",
                            borderRadius: "6px",
                            border: "1px solid var(--border)",
                            fontSize: "12.5px",
                          }}
                        >
                          <strong style={{ color: "var(--text)" }}>{screen.name}</strong>:{" "}
                          <span style={{ color: "var(--text-muted)" }}>{screen.userAction}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data it Needs */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid var(--border)",
                      borderRadius: "12px",
                      padding: "18px",
                    }}
                  >
                    <div className="card-kicker">04 · Data Storage For MVP</div>
                    <h4 style={{ margin: "4px 0 12px", fontSize: "16px" }}>Data & Persistence</h4>
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--mono)",
                          color: "var(--text-soft)",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        Core Data Needed:
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: "12.5px", color: "var(--text)", lineHeight: "1.5" }}>
                        {blueprint.productMap.dataItNeeds.description}
                      </p>
                    </div>
                    <div
                      style={{
                        background: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#065f46",
                        marginBottom: "8px",
                      }}
                    >
                      <strong>Storage for MVP:</strong> {blueprint.productMap.dataItNeeds.storageForMvp}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                      <strong>Later upgrade options:</strong> {blueprint.productMap.dataItNeeds.laterOptions}
                    </div>
                  </div>
                </div>

                {/* 4. Parts You Need Now vs Parts You Can IGNORE For Now */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #86efac",
                      borderRadius: "12px",
                      padding: "18px",
                    }}
                  >
                    <div className="card-kicker" style={{ color: "#166534" }}>
                      ✓ Build in Phase 1
                    </div>
                    <h4 style={{ margin: "4px 0 10px", fontSize: "16px" }}>Parts You Need NOW</h4>
                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#1e293b", lineHeight: "1.7" }}>
                      {blueprint.productMap.partsYouNeedNow.map((p, idx) => (
                        <li key={idx}><strong>{p.part}</strong>: {p.reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #fed7aa",
                      borderRadius: "12px",
                      padding: "18px",
                    }}
                  >
                    <div className="card-kicker" style={{ color: "#9a3412" }}>
                      ⚠️ Scope Protection (Zero MVP Bloat)
                    </div>
                    <h4 style={{ margin: "4px 0 10px", fontSize: "16px" }}>Parts You Can IGNORE For Now</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {blueprint.productMap.partsYouCanIgnoreForNow.map((p, idx) => (
                        <div key={idx} style={{ fontSize: "12.5px" }}>
                          <strong style={{ color: "#9a3412" }}>✕ {p.part}:</strong>{" "}
                          <span style={{ color: "var(--text-muted)" }}>{p.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. MVP Scope Boundaries: v1 vs v2 vs v3 */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker">05 · Phased Scope Boundaries</div>
                  <h4 style={{ margin: "4px 0 14px", fontSize: "17px" }}>MVP vs Later Versions</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <strong style={{ fontSize: "12.5px", color: "#166534", textTransform: "uppercase" }}>
                        v1 (Demo Ready)
                      </strong>
                      <ul style={{ margin: "8px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#1e293b" }}>
                        {blueprint.productMap.mvpVsLater.v1DemoReady.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <strong style={{ fontSize: "12.5px", color: "#334155", textTransform: "uppercase" }}>
                        v2 (Fast Follow)
                      </strong>
                      <ul style={{ margin: "8px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#475569" }}>
                        {blueprint.productMap.mvpVsLater.v2Next.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <strong style={{ fontSize: "12.5px", color: "#475569", textTransform: "uppercase" }}>
                        v3 (Full Product)
                      </strong>
                      <ul style={{ margin: "8px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#64748b" }}>
                        {blueprint.productMap.mvpVsLater.v3Future.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 6. Next Implementation Steps */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "18px",
                  }}
                >
                  <div className="card-kicker">06 · After The Demo Works</div>
                  <h4 style={{ margin: "4px 0 12px", fontSize: "17px" }}>Next Implementation Steps</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {blueprint.productMap.nextImplementationSteps.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: "13px",
                          padding: "8px 12px",
                          background: "var(--surface-alt)",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <strong>Step {idx + 1}: {step.step}</strong> —{" "}
                        <span style={{ color: "var(--text-muted)" }}>{step.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BUILD MILESTONES (INTERACTIVE ROADMAP GRAPH) */}
            {activeTab === "milestones" && blueprint.nodes && blueprint.nodes.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <RoadmapGraph
                  nodes={blueprint.nodes}
                  ideaText={inputText}
                  completedNodeIds={completedNodeIds}
                  onToggleNode={handleToggleNode}
                  savedReviews={savedReviews}
                  onSaveReview={handleSaveReview}
                  savedArtifactReviews={savedArtifactReviews}
                  onSaveArtifactReview={handleSaveArtifactReview}
                  savedArtifactDrafts={savedArtifactDrafts}
                  onSaveArtifactDraft={handleSaveArtifactDraft}
                  onShowToast={onShowToast}
                />
              </div>
            )}

            {/* TAB 5: LEVEL UP LATER (ADVANCED TOPICS COLLAPSED BY DEFAULT) */}
            {activeTab === "level_up" && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker">Deferred Complexity</div>
                  <h4 style={{ margin: "4px 0 8px", fontSize: "17px" }}>
                    Advanced Topics Intentionally Kept Out of the MVP
                  </h4>
                  <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0 }}>
                    Beginners fail when attempting to configure cloud databases, OAuth logins, and payment SDKs
                    before validating their core product loop. These topics are ready for you once Phase 1 is demoed:
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Topic 1: Cloud Databases */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLevelUp("database")}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "14px" }}>Cloud Databases & Multi-User Persistence</strong>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Why deferred: Browser LocalStorage provides 100% reliable zero-server demos.
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedLevelUpItems["database"] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedLevelUpItems["database"] && (
                      <div style={{ padding: "0 18px 16px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6", borderTop: "1px solid var(--border)" }}>
                        <p style={{ marginTop: "12px" }}>
                          When multiple users need to share records or access data across devices, upgrade from
                          LocalStorage to a serverless PostgreSQL database like <strong>Supabase</strong> or <strong>Neon</strong>.
                        </p>
                        <a
                          href="https://supabase.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--accent-green)", textDecoration: "underline", fontSize: "12px" }}
                        >
                          Supabase Quickstart (official docs)
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Topic 2: User Authentication */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLevelUp("auth")}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "14px" }}>User Accounts & OAuth Logins</strong>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Why deferred: Authentication forms add friction for hackathon judges evaluating your tool.
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedLevelUpItems["auth"] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedLevelUpItems["auth"] && (
                      <div style={{ padding: "0 18px 16px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6", borderTop: "1px solid var(--border)" }}>
                        <p style={{ marginTop: "12px" }}>
                          Add authentication using <strong>Clerk</strong> or <strong>NextAuth</strong> only when personal accounts
                          are mandatory. For Phase 1, an instant tactile demo always scores higher than a login wall.
                        </p>
                        <a
                          href="https://clerk.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--accent-green)", textDecoration: "underline", fontSize: "12px" }}
                        >
                          Clerk Authentication Docs (official docs)
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Topic 3: Production Deployment */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLevelUp("deploy")}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "14px" }}>Custom Domains & Production CDN Hosting</strong>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Why deferred: Test locally with <code>npm run dev</code> first before deploying.
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedLevelUpItems["deploy"] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedLevelUpItems["deploy"] && (
                      <div style={{ padding: "0 18px 16px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6", borderTop: "1px solid var(--border)" }}>
                        <p style={{ marginTop: "12px" }}>
                          Deploy your app with one click to <strong>Vercel</strong> or <strong>Netlify</strong>. Connect your GitHub repository
                          and every commit will automatically deploy to a public URL.
                        </p>
                        <a
                          href="https://vercel.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--accent-green)", textDecoration: "underline", fontSize: "12px" }}
                        >
                          Vercel Git Deployment (official docs)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SHIP IT (HACKATHON WRAP-UP) */}
            {activeTab === "ship_it" && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker" style={{ color: "#e11d48" }}>
                    ✦ Devpost Submission Wrap-Up
                  </div>
                  <h4 style={{ margin: "4px 0 8px", fontSize: "18px" }}>
                    Finishing "Build With AI: Basics 2026"
                  </h4>
                  <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: "0 0 16px" }}>
                    Follow this exact checklist to record your required short demo video, push to GitHub, and submit on Devpost.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Demo Video Script Card */}
                    <div
                      style={{
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        borderRadius: "10px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Video className="w-4 h-4 text-rose-600" />
                        <strong style={{ fontSize: "13.5px", color: "#9f1239" }}>
                          Required 2–3 Minute Demo Video Outline
                        </strong>
                      </div>
                      <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", lineHeight: "1.6", color: "#881337" }}>
                        <li><strong>0:00 - 0:30 Hook & Problem:</strong> What beginner problem does {blueprint.projectTitle} solve?</li>
                        <li><strong>0:30 - 1:45 Core Live Demo:</strong> Show the primary user journey in action with real clicks.</li>
                        <li><strong>1:45 - 2:30 Technical Choices:</strong> Mention why you used zero-database storage and pair-programmed with AI.</li>
                        <li><strong>2:30 - 3:00 What's Next:</strong> Mention 1 feature from your v2 roadmap.</li>
                      </ol>
                    </div>

                    {/* GitHub Repo Card */}
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Github className="w-4 h-4 text-slate-800" />
                        <strong style={{ fontSize: "13.5px", color: "#1e293b" }}>
                          Public GitHub Repository Checklist
                        </strong>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", lineHeight: "1.6", color: "#334155" }}>
                        <li>Public repository visibility (not private).</li>
                        <li>Clean <code>README.md</code> with project title, demo screenshot, and local run command.</li>
                        <li>Proper <code>.gitignore</code> preventing <code>node_modules/</code> or <code>.env</code> commits.</li>
                        <li>At least 4 incremental commits matching your build milestones.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Devpost Submission Helper */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div className="card-kicker">Devpost Description Draft</div>
                  <h4 style={{ margin: "4px 0 12px", fontSize: "16px" }}>
                    Copy-Paste Submission Template
                  </h4>
                  <pre
                    style={{
                      background: "var(--surface-alt)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "14px",
                      fontSize: "12px",
                      lineHeight: "1.5",
                      fontFamily: "var(--mono)",
                      color: "var(--text)",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
{`### Inspiration
Built for the Build With AI: Basics hackathon. I wanted a mentor-in-a-box to guide me through building ${blueprint.projectTitle} without getting bogged down by complicated backend infrastructure.

### What it does
${blueprint.productMap?.whatItDoes || blueprint.summary}

### How we built it
- Calibrated tech stack: ${blueprint.techStack.map((s) => s.name).join(", ")}
- Pair-programmed step by step using AI coding agents, verified through incremental definition-of-done checks.
- Zero-database Phase 1 architecture for guaranteed presentation reliability.

### Challenges we ran into
Guarding against scope creep and keeping the MVP strictly focused on the primary user journey.

### What's next
${blueprint.productMap?.nextImplementationSteps.map((s) => `- ${s.step}`).join("\n") || "Deploying to production and adding multi-user support."}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
