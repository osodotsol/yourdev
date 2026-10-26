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
  Square,
  CheckSquare,
  Github,
  CheckCircle2,
} from "lucide-react";
import { RoadmapGraph } from "@/components/RoadmapGraph";
import { MarkdownContent, InlineMarkdown } from "@/components/MarkdownRenderer";
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
  const [exportView, setExportView] = useState<"formatted" | "raw">("formatted");
  const [copiedExport, setCopiedExport] = useState(false);
  const [checkedGuidelines, setCheckedGuidelines] = useState<Record<number, boolean>>({});

  const toggleGuideline = (index: number) => {
    setCheckedGuidelines((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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
          <span>⚡ YOURDEV STUDIO // BUILD IT. UNDERSTAND IT. VERIFY IT.</span>
          <span>YOURDEV ARCHITECTURE & VERIFICATION STUDIO</span>
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
                <div
                  style={{
                    fontSize: "14.5px",
                    lineHeight: "1.55",
                    color: "var(--text-muted)",
                    maxWidth: "700px",
                  }}
                >
                  <MarkdownContent content={blueprint.summary} />
                </div>
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

            {/* PLAN CALIBRATION CONTEXT */}
            <div
              style={{
                marginTop: "18px",
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "12px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text)",
                    }}
                  >
                    Strategy Calibration
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--mono)",
                      background: "var(--surface-alt)",
                      color: "var(--text-muted)",
                      padding: "3px 9px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <strong style={{ color: "var(--text)", fontWeight: 600 }}>Style:</strong>{" "}
                    {userChoices["coding_style"] === "myself"
                      ? "Mostly Myself"
                      : userChoices["coding_style"] === "mix"
                      ? "Balanced Mix"
                      : "Vibe Coding"}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--mono)",
                      background: "var(--surface-alt)",
                      color: "var(--text-muted)",
                      padding: "3px 9px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <strong style={{ color: "var(--text)", fontWeight: 600 }}>Level:</strong>{" "}
                    {userChoices["experience_level"] === "intermediate"
                      ? "Build Already"
                      : userChoices["experience_level"] === "beginner"
                      ? "Know A Little"
                      : "Beginner-First"}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--mono)",
                      background: "var(--surface-alt)",
                      color: "var(--text-muted)",
                      padding: "3px 9px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <strong style={{ color: "var(--text)", fontWeight: 600 }}>Dedication:</strong>{" "}
                    ~8.5h required
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                <MarkdownContent content={blueprint.strategyDecision} />
              </div>
            </div>

            {/* STUDIO NAVIGATION TABS */}
            <div className="output-tabs-bar" role="tablist" style={{ marginTop: "20px" }}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "start_here"}
                className={`output-tab-btn ${
                  activeTab === "start_here" ? "is-active" : ""
                }`}
                onClick={() => setActiveTab("start_here")}
              >
                <span>1. Start Here</span>
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
                <span>2. Learn First</span>
                {allFoundations.length > 0 && (
                  <span className="output-tab-count">
                    {visibleFoundations.length} Modules
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
                <span>3. Project Map & Parts</span>
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
                <span>4. Build Milestones</span>
                {blueprint.nodes && (
                  <span className="output-tab-count">
                    {blueprint.nodes.length} Steps
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
                <span>5. Level Up Later</span>
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
                <span>6. Launch & Export</span>
              </button>
            </div>

            {/* TAB 1: START HERE ("YOUR FIRST 20 MINUTES") */}
            {activeTab === "start_here" && (
              <div style={{ marginTop: "16px" }}>
                {blueprint.first20Minutes && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "16px",
                      padding: "24px 26px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px -4px rgba(0, 0, 0, 0.04)",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Header Pill */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginBottom: "14px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            background: "#0f172a",
                            color: "#ffffff",
                            padding: "3px 8px",
                            borderRadius: "5px",
                            fontFamily: "var(--mono)",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                          }}
                        >
                          STEP 01
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#64748b",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          Immediate Action · First 20 Minutes
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--mono)",
                          color: "#64748b",
                          background: "#f1f5f9",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        ⏱ Est. 20 min setup
                      </span>
                    </div>

                    {/* Headline */}
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        margin: "0 0 10px",
                        color: "#0f172a",
                        lineHeight: "1.35",
                      }}
                    >
                      {blueprint.first20Minutes.action}
                    </h3>

                    {/* Why this comes first */}
                    <div
                      style={{
                        fontSize: "13.5px",
                        color: "#475569",
                        lineHeight: "1.6",
                        marginBottom: "20px",
                        borderLeft: "3px solid #0f172a",
                        paddingLeft: "14px",
                        background: "rgba(15, 23, 42, 0.02)",
                        paddingBlock: "8px",
                        borderRadius: "0 6px 6px 0",
                      }}
                    >
                      <strong style={{ color: "#0f172a" }}>Why this comes first:</strong>{" "}
                      <InlineMarkdown text={blueprint.first20Minutes.why} />
                    </div>

                    {/* Structured Execution Sequence */}
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        marginBottom: "20px",
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          background: "#f8fafc",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#334155",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Action Steps
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--mono)",
                            color: "#94a3b8",
                          }}
                        >
                          {blueprint.first20Minutes.whatToDo.length} sequential tasks
                        </span>
                      </div>

                      <div style={{ padding: "6px 16px" }}>
                        {blueprint.first20Minutes.whatToDo.map((step, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                              paddingBlock: "10px",
                              borderBottom:
                                idx < blueprint.first20Minutes!.whatToDo.length - 1
                                  ? "1px solid #f1f5f9"
                                  : "none",
                            }}
                          >
                            <span
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                background: "#0f172a",
                                color: "#ffffff",
                                fontSize: "11px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: "1px",
                              }}
                            >
                              {idx + 1}
                            </span>
                            <div
                              style={{
                                fontSize: "13.5px",
                                lineHeight: "1.6",
                                color: "#1e293b",
                                flex: 1,
                              }}
                            >
                              <InlineMarkdown text={step} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Optional Starter Command Bar */}
                      {blueprint.first20Minutes.starterTerminalCommand && (
                        <div
                          style={{
                            background: "#0f172a",
                            borderTop: "1px solid #334155",
                            padding: "10px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <span
                              style={{
                                color: "#10b981",
                                fontFamily: "var(--mono)",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              $
                            </span>
                            <code
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "12px",
                                color: "#f8fafc",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {blueprint.first20Minutes.starterTerminalCommand}
                            </code>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                blueprint.first20Minutes!.starterTerminalCommand!
                              );
                              onShowToast("Terminal command copied!");
                            }}
                            style={{
                              background: "rgba(255, 255, 255, 0.1)",
                              color: "#f8fafc",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "11px",
                              fontFamily: "var(--mono)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              flexShrink: 0,
                              transition: "background 0.15s ease",
                            }}
                            title="Copy command to clipboard"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Definition of Done Checkpoint */}
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "10px",
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--mono)",
                            fontWeight: 700,
                            color: "#166534",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "3px",
                          }}
                        >
                          Definition of Done
                        </div>
                        <div style={{ fontSize: "13px", color: "#14532d", lineHeight: "1.5" }}>
                          <InlineMarkdown text={blueprint.first20Minutes.whatDoneLooksLike} />
                        </div>
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
                {/* Header with Quick Path vs Full Curriculum Toggle */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                    background: "#ffffff",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "14px",
                    padding: "18px 22px",
                    marginBottom: "18px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div>
                    <div className="card-kicker">Foundations Track</div>
                    <h4 style={{ margin: "2px 0 4px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                      Curated Foundations Curriculum
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                      Core architectural concepts to understand before writing complex business logic.
                    </p>
                  </div>

                  {/* Mode Toggle */}
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
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "var(--mono)",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: vibeMode ? "#0f172a" : "transparent",
                        color: vibeMode ? "#ffffff" : "var(--text-muted)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Core Track (Fast)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVibeMode(false)}
                      style={{
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "var(--mono)",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: !vibeMode ? "#0f172a" : "transparent",
                        color: !vibeMode ? "#ffffff" : "var(--text-muted)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Complete Curriculum
                    </button>
                  </div>
                </div>

                {/* Foundations Progress Bar */}
                <div
                  style={{
                    background: "#fafafa",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontFamily: "var(--mono)",
                      color: "#64748b",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontWeight: 700, letterSpacing: "0.05em" }}>CURRICULUM COMPLETION</span>
                    <strong style={{ color: "#0f172a" }}>
                      {foundationsDoneCount}/{visibleFoundations.length} Modules ({foundationsPercent}%)
                    </strong>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "#e2e8f0",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${foundationsPercent}%`,
                        height: "100%",
                        background: "#10b981",
                        borderRadius: "999px",
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
                          border: isDone ? "1.5px solid #86efac" : "1px solid var(--border)",
                          borderRadius: "14px",
                          padding: "20px 22px",
                          boxShadow: isDone
                            ? "0 2px 10px rgba(16, 185, 129, 0.05)"
                            : "0 1px 3px rgba(0, 0, 0, 0.02)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "12px",
                            marginBottom: "12px",
                            flexWrap: "wrap",
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
                                fontSize: "10.5px",
                                fontWeight: 700,
                                color: "#ffffff",
                                background: "#0f172a",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                letterSpacing: "0.05em",
                              }}
                            >
                              MODULE {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                            </span>

                            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                              {mod.title}
                            </h4>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontFamily: "var(--mono)",
                                color: "#64748b",
                                background: "#f1f5f9",
                                padding: "3px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              ⏱ ~{mod.minutes}m
                            </span>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontFamily: "var(--mono)",
                                fontWeight: 600,
                                padding: "3px 8px",
                                borderRadius: "4px",
                                background: "rgba(15, 23, 42, 0.05)",
                                color: "#334155",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {mod.tier.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Plain English Summary with Analogy */}
                        <div
                          style={{
                            fontSize: "13.5px",
                            lineHeight: "1.6",
                            color: "var(--text)",
                            marginBottom: "14px",
                          }}
                        >
                          <InlineMarkdown text={mod.plainEnglishSummary} />
                        </div>

                        {/* Why for YOUR project */}
                        <div
                          style={{
                            borderLeft: "3px solid #0f172a",
                            paddingLeft: "14px",
                            background: "rgba(15, 23, 42, 0.02)",
                            paddingBlock: "8px",
                            borderRadius: "0 6px 6px 0",
                            fontSize: "13px",
                            color: "#334155",
                            lineHeight: "1.55",
                            marginBottom: "14px",
                          }}
                        >
                          <strong style={{ color: "#0f172a" }}>Why for your project:</strong>{" "}
                          <InlineMarkdown text={mod.whyNeededForProject || mod.plainEnglishSummary} />
                        </div>

                        {/* Mode Specific Guidance */}
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "#475569",
                            lineHeight: "1.55",
                            marginBottom: "14px",
                            padding: "10px 14px",
                            background: "#fafafa",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <strong style={{ color: "#0f172a" }}>
                            {vibeMode ? "Core Path Focus:" : "Architectural Context:"}
                          </strong>{" "}
                          <InlineMarkdown text={vibeMode ? mod.vibeMinimumNote : mod.deeperNote} />
                        </div>

                        {/* You're done when checks */}
                        <div
                          style={{
                            borderTop: "1px solid var(--border)",
                            paddingTop: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "12.5px",
                              color: "#166534",
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Done when:</strong>{" "}
                              <InlineMarkdown text={mod.youreDoneWhen.join(" · ")} />
                            </span>
                          </div>

                          {/* Official Doc Link (Honest Labeling) */}
                          <a
                            href={mod.officialResource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "11.5px",
                              fontFamily: "var(--mono)",
                              color: "var(--text-muted)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "none",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: "var(--surface-alt)",
                              border: "1px solid var(--border)",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <span>{mod.officialResource.title} (docs)</span>
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
                      border: "1px solid var(--border-strong)",
                      borderRadius: "16px",
                      padding: "24px 26px",
                      marginBottom: "20px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            background: "#0f172a",
                            color: "#ffffff",
                            padding: "4px 10px",
                            borderRadius: "5px",
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          PROJECT ARCHITECTURE
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#475569",
                            background: "var(--surface-alt)",
                            border: "1px solid var(--border)",
                            padding: "3px 9px",
                            borderRadius: "5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {blueprint.architecture.project_type}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontFamily: "var(--mono)",
                          color: "#64748b",
                          background: "#f1f5f9",
                          padding: "3px 9px",
                          borderRadius: "4px",
                        }}
                      >
                        {blueprint.architecture.parts.length} distinct system components
                      </span>
                    </div>

                    {/* Back End vs Front End Explained Simply */}
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        marginBottom: "16px",
                      }}
                    >
                      <div className="card-kicker">Separation of Concerns</div>
                      <h4
                        style={{
                          margin: "2px 0 8px",
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        Client vs Server Mechanics
                      </h4>
                      <div style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.6", color: "var(--text)" }}>
                        <MarkdownContent content={blueprint.architecture.front_back_explained_simply} />
                      </div>
                    </div>

                    {/* Preview of Finished Product */}
                    {blueprint.architecture.finished_product_preview && (
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "16px 20px",
                          marginBottom: "16px",
                        }}
                      >
                        <div className="card-kicker">Product End-State</div>
                        <h4
                          style={{
                            margin: "2px 0 8px",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          Working Prototype Preview
                        </h4>
                        <div style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.6", color: "var(--text)" }}>
                          <MarkdownContent content={blueprint.architecture.finished_product_preview} />
                        </div>
                      </div>
                    )}

                    {/* Recommended Stack & Alternatives */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "18px 20px",
                        marginBottom: "20px",
                      }}
                    >
                      <div className="card-kicker">Recommended Stack</div>
                      <h4 style={{ margin: "2px 0 10px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                        Calibrated Tools & Runtime
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "12px",
                            fontFamily: "var(--mono)",
                            background: "#0f172a",
                            color: "#ffffff",
                            padding: "3px 9px",
                            borderRadius: "5px",
                          }}
                        >
                          {blueprint.architecture.recommended_stack.language}
                        </span>
                        {blueprint.architecture.recommended_stack.framework_or_tools.map((tool, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "5px",
                              padding: "3px 9px",
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
                        <strong style={{ color: "#0f172a" }}>Why in plain English:</strong>{" "}
                        <InlineMarkdown text={blueprint.architecture.recommended_stack.why_in_plain_english} />
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
                                letterSpacing: "0.05em",
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
                      <h4 style={{ margin: "4px 0 16px", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                        System Components
                      </h4>

                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {blueprint.architecture.parts.map((part, idx) => {
                          return (
                            <div
                              key={part.id || idx}
                              style={{
                                background: "#ffffff",
                                border: "1px solid var(--border)",
                                borderRadius: "12px",
                                padding: "18px 20px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                  marginBottom: "10px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                                  <h5 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                                    {part.name}
                                  </h5>
                                </div>

                                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontFamily: "var(--mono)",
                                      fontWeight: 600,
                                      borderRadius: "4px",
                                      padding: "3px 8px",
                                      background: "rgba(15, 23, 42, 0.05)",
                                      color: "#334155",
                                      border: "1px solid #e2e8f0",
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

                              <p style={{ fontSize: "13.5px", color: "var(--text)", margin: "0 0 12px", lineHeight: "1.55" }}>
                                {part.one_line_purpose}
                              </p>

                              {part.example_look_feel_function && (
                                <div
                                  style={{
                                    background: "#fafafa",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    padding: "10px 14px",
                                    marginBottom: "12px",
                                    fontSize: "12.5px",
                                    color: "#334155",
                                    lineHeight: "1.55",
                                  }}
                                >
                                  <strong style={{ color: "#0f172a" }}>Behavior & Specification:</strong>{" "}
                                  {part.example_look_feel_function}
                                </div>
                              )}

                              {part.steps && part.steps.length > 0 && (
                                <div style={{ marginBottom: "12px" }}>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      fontFamily: "var(--mono)",
                                      color: "#64748b",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.05em",
                                      marginBottom: "6px",
                                    }}
                                  >
                                    Build Steps:
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {part.steps.map((s, sIdx) => (
                                      <div
                                        key={sIdx}
                                        style={{
                                          display: "flex",
                                          alignItems: "flex-start",
                                          gap: "8px",
                                          fontSize: "12.5px",
                                          color: "#1e293b",
                                          lineHeight: "1.5",
                                        }}
                                      >
                                        <span
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                            borderRadius: "50%",
                                            background: "#f1f5f9",
                                            color: "#475569",
                                            fontSize: "10px",
                                            fontFamily: "var(--mono)",
                                            fontWeight: 700,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            marginTop: "2px",
                                          }}
                                        >
                                          {sIdx + 1}
                                        </span>
                                        <span>{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {part.resources && part.resources.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                  <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "#64748b" }}>
                                    Resources:
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
                                        background: "var(--surface-alt)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "5px",
                                        padding: "3px 8px",
                                        fontSize: "11.5px",
                                        color: "var(--text)",
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
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    padding: "20px 22px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker">01 · Plain English Definition</div>
                  <h4 style={{ margin: "4px 0 8px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                    What It Does
                  </h4>
                  <div style={{ fontSize: "14.5px", lineHeight: "1.6", color: "var(--text)", margin: 0 }}>
                    <MarkdownContent content={blueprint.productMap.whatItDoes} />
                  </div>
                </div>

                {/* 2. User Journey */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    padding: "20px 22px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker">02 · End-to-End User Experience</div>
                  <h4 style={{ margin: "4px 0 14px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                    User Journey
                  </h4>
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
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "#0f172a",
                            color: "#ffffff",
                            width: "22px",
                            height: "22px",
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
                          <InlineMarkdown text={stepStr} />
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
                      border: "1px solid var(--border)",
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <div className="card-kicker">03 · UI Boundaries</div>
                    <h4 style={{ margin: "4px 0 12px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      Screens
                    </h4>
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
                          <span style={{ color: "var(--text-muted)" }}>
                            <InlineMarkdown text={screen.userAction} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data it Needs */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <div className="card-kicker">04 · Data Storage For MVP</div>
                    <h4 style={{ margin: "4px 0 12px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      Data & Persistence
                    </h4>
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
                      <div style={{ margin: "0 0 10px", fontSize: "12.5px", color: "var(--text)", lineHeight: "1.5" }}>
                        <InlineMarkdown text={blueprint.productMap.dataItNeeds.description} />
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#166534",
                        marginBottom: "8px",
                      }}
                    >
                      <strong>Storage for MVP:</strong>{" "}
                      <InlineMarkdown text={blueprint.productMap.dataItNeeds.storageForMvp} />
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                      <strong>Later upgrade options:</strong>{" "}
                      <InlineMarkdown text={blueprint.productMap.dataItNeeds.laterOptions} />
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
                      border: "1px solid #bbf7d0",
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <div className="card-kicker" style={{ color: "#166534" }}>
                      ✓ Build in Phase 1
                    </div>
                    <h4 style={{ margin: "4px 0 10px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      Parts You Need NOW
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#1e293b", lineHeight: "1.7" }}>
                      {blueprint.productMap.partsYouNeedNow.map((p, idx) => (
                        <li key={idx}>
                          <strong>{p.part}</strong>: <InlineMarkdown text={p.reason} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <div className="card-kicker" style={{ color: "#64748b" }}>
                      Scope Protection (Deferred)
                    </div>
                    <h4 style={{ margin: "4px 0 10px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      Parts You Can IGNORE For Now
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {blueprint.productMap.partsYouCanIgnoreForNow.map((p, idx) => (
                        <div key={idx} style={{ fontSize: "12.5px" }}>
                          <strong style={{ color: "#64748b" }}>— {p.part}:</strong>{" "}
                          <span style={{ color: "var(--text-muted)" }}>
                            <InlineMarkdown text={p.reason} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. MVP Scope Boundaries: v1 vs v2 vs v3 */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <div className="card-kicker">05 · Phased Scope Boundaries</div>
                  <h4 style={{ margin: "4px 0 14px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                    MVP vs Later Versions
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "14px",
                        borderRadius: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "12px", fontFamily: "var(--mono)", color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        v1 (Demo Ready)
                      </strong>
                      <ul style={{ margin: "8px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#1e293b", lineHeight: "1.6" }}>
                        {blueprint.productMap.mvpVsLater.v1DemoReady.map((f, i) => (
                          <li key={i}>
                            <InlineMarkdown text={f} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #e2e8f0",
                        padding: "14px",
                        borderRadius: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "12px", fontFamily: "var(--mono)", color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        v2 (Fast Follow)
                      </strong>
                      <ul style={{ margin: "8px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>
                        {blueprint.productMap.mvpVsLater.v2Next.map((f, i) => (
                          <li key={i}>
                            <InlineMarkdown text={f} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid #e2e8f0",
                        padding: "14px",
                        borderRadius: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "12px", fontFamily: "var(--mono)", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        v3 (Full Product)
                      </strong>
                      <ul style={{ margin: "8px 0 0", paddingLeft: "16px", fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                        {blueprint.productMap.mvpVsLater.v3Future.map((f, i) => (
                          <li key={i}>
                            <InlineMarkdown text={f} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 6. Next Implementation Steps */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <div className="card-kicker">06 · After The Demo Works</div>
                  <h4 style={{ margin: "4px 0 12px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                    Next Implementation Steps
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {blueprint.productMap.nextImplementationSteps.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: "13px",
                          padding: "10px 14px",
                          background: "var(--surface-alt)",
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <strong style={{ color: "#0f172a" }}>
                          Step {idx + 1}: <InlineMarkdown text={step.step} />
                        </strong>{" "}
                        —{" "}
                        <span style={{ color: "var(--text-muted)" }}>
                          <InlineMarkdown text={step.reason} />
                        </span>
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
                    border: "1px solid var(--border-strong)",
                    borderRadius: "14px",
                    padding: "20px 24px",
                    marginBottom: "18px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div className="card-kicker">Deferred Complexity</div>
                  <h4 style={{ margin: "2px 0 6px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                    Advanced Topics Intentionally Kept Out of the MVP
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.6" }}>
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
                      borderRadius: "12px",
                      overflow: "hidden",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLevelUp("database")}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
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
                        <strong style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a" }}>
                          Cloud Databases & Multi-User Persistence
                        </strong>
                        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "3px" }}>
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
                      <div
                        style={{
                          padding: "14px 20px 18px",
                          fontSize: "13px",
                          color: "var(--text)",
                          lineHeight: "1.6",
                          borderTop: "1px solid var(--border)",
                          background: "#fafafa",
                        }}
                      >
                        <p style={{ margin: "0 0 10px" }}>
                          When multiple users need to share records or access data across devices, upgrade from
                          LocalStorage to a serverless PostgreSQL database like <strong>Supabase</strong> or <strong>Neon</strong>.
                        </p>
                        <a
                          href="https://supabase.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "#ffffff",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            fontSize: "12px",
                            textDecoration: "none",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          <span>Supabase Quickstart (docs)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Topic 2: User Authentication */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLevelUp("auth")}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
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
                        <strong style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a" }}>
                          User Accounts & OAuth Logins
                        </strong>
                        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "3px" }}>
                          Why deferred: Authentication forms add friction for initial users evaluating your tool.
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedLevelUpItems["auth"] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedLevelUpItems["auth"] && (
                      <div
                        style={{
                          padding: "14px 20px 18px",
                          fontSize: "13px",
                          color: "var(--text)",
                          lineHeight: "1.6",
                          borderTop: "1px solid var(--border)",
                          background: "#fafafa",
                        }}
                      >
                        <p style={{ margin: "0 0 10px" }}>
                          Add authentication using <strong>Clerk</strong> or <strong>NextAuth</strong> only when personal accounts
                          are mandatory. For Phase 1, an instant tactile demo always scores higher than a login wall.
                        </p>
                        <a
                          href="https://clerk.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "#ffffff",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            fontSize: "12px",
                            textDecoration: "none",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          <span>Clerk Authentication (docs)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Topic 3: Production Deployment */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLevelUp("deploy")}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
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
                        <strong style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a" }}>
                          Custom Domains & Production CDN Hosting
                        </strong>
                        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "3px" }}>
                          Why deferred: Test locally first with <code>npm run dev</code> before deploying.
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedLevelUpItems["deploy"] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedLevelUpItems["deploy"] && (
                      <div
                        style={{
                          padding: "14px 20px 18px",
                          fontSize: "13px",
                          color: "var(--text)",
                          lineHeight: "1.6",
                          borderTop: "1px solid var(--border)",
                          background: "#fafafa",
                        }}
                      >
                        <p style={{ margin: "0 0 10px" }}>
                          Deploy your app with one click to <strong>Vercel</strong> or <strong>Netlify</strong>. Connect your GitHub repository
                          and every commit will automatically deploy to a public URL.
                        </p>
                        <a
                          href="https://vercel.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "#ffffff",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            fontSize: "12px",
                            textDecoration: "none",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          <span>Vercel Git Deployment (docs)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: LAUNCH & EXPORT */}
            {activeTab === "ship_it" && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "16px",
                    padding: "22px 26px",
                    marginBottom: "18px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div className="card-kicker">
                    Project Launch · Optional Guidance
                  </div>
                  <h4 style={{ margin: "2px 0 6px", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                    Preparing {blueprint.projectTitle} for Launch
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 18px", lineHeight: "1.55" }}>
                    Review these recommended repository guidelines for publishing {blueprint.projectTitle}, and export your complete project blueprint below. These items are suggestions for self-verification, not automated checks.
                  </p>

                  {/* Repository Checklist Card */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "14px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Github className="w-4 h-4 text-slate-800" />
                        <strong style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                          Source Code & Repository Checklist
                        </strong>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          background: "var(--surface-alt)",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          padding: "2px 8px",
                        }}
                      >
                        Optional Self-Check
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        {
                          title: "Repository Visibility & Access",
                          desc: "Configure public or team access so collaborators or users can access the code.",
                        },
                        {
                          title: "Project Documentation (README.md)",
                          desc: `Document the purpose of ${blueprint.projectTitle}, local setup commands (e.g. npm install, npm run dev), and environment variables.`,
                        },
                        {
                          title: "Clean .gitignore Configuration",
                          desc: "Prevent committing node_modules/, local secrets (.env.local), build caches, or temporary artifacts.",
                        },
                        {
                          title: "Structured Git Commit History",
                          desc: "Ensure commit history reflects clear, incremental milestones and working progress.",
                        },
                      ].map((item, i) => {
                        const isChecked = Boolean(checkedGuidelines[i]);
                        return (
                          <div
                            key={i}
                            onClick={() => toggleGuideline(i)}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleGuideline(i);
                              }
                            }}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "10px",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: isChecked ? "1px solid #cbd5e1" : "1px solid var(--border)",
                              background: isChecked ? "#f8fafc" : "#ffffff",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <div style={{ fontSize: "12.5px", lineHeight: "1.5" }}>
                              <strong style={{ color: "#0f172a", display: "inline-block", marginRight: "6px" }}>
                                {item.title}:
                              </strong>
                              <span style={{ color: "#475569" }}>{item.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p style={{ margin: "12px 0 0", fontSize: "11.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Note: These items are recommendations for your manual pre-launch review. YourDev does not inspect external Git hosts.
                    </p>
                  </div>
                </div>

                {/* Full Project Blueprint Export */}
                {(() => {
                  const blueprintMarkdown = formatBlueprintMarkdown(blueprint);

                  const handleCopyExport = async () => {
                    try {
                      await navigator.clipboard.writeText(blueprintMarkdown);
                      setCopiedExport(true);
                      onShowToast("✓ COPIED FULL BLUEPRINT MARKDOWN");
                      setTimeout(() => setCopiedExport(false), 2000);
                    } catch {
                      onShowToast("Failed to copy blueprint.");
                    }
                  };

                  return (
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--border)",
                        borderRadius: "14px",
                        padding: "22px 24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginBottom: "14px",
                        }}
                      >
                        <div>
                          <div className="card-kicker">Complete Strategy Export</div>
                          <h4 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                            Full Project Blueprint (Markdown)
                          </h4>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              display: "flex",
                              background: "var(--surface-alt)",
                              padding: "3px",
                              borderRadius: "8px",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setExportView("formatted")}
                              style={{
                                padding: "5px 10px",
                                fontSize: "11.5px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                background: exportView === "formatted" ? "#18191a" : "transparent",
                                color: exportView === "formatted" ? "#ffffff" : "var(--text-muted)",
                              }}
                            >
                              Formatted
                            </button>
                            <button
                              type="button"
                              onClick={() => setExportView("raw")}
                              style={{
                                padding: "5px 10px",
                                fontSize: "11.5px",
                                fontWeight: 600,
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                background: exportView === "raw" ? "#18191a" : "transparent",
                                color: exportView === "raw" ? "#ffffff" : "var(--text-muted)",
                              }}
                            >
                              Raw Markdown
                            </button>
                          </div>

                          <button
                            type="button"
                            className="btn-craft-secondary"
                            style={{
                              padding: "6px 14px",
                              fontSize: "12px",
                              background: "#18191a",
                              color: "#fff",
                              borderColor: "#333",
                            }}
                            onClick={handleCopyExport}
                          >
                            {copiedExport ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Blueprint Markdown</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {exportView === "formatted" ? (
                        <div
                          style={{
                            background: "var(--surface-alt)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            padding: "18px 20px",
                          }}
                        >
                          <MarkdownContent content={blueprintMarkdown} />
                        </div>
                      ) : (
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
                          {blueprintMarkdown}
                        </pre>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
