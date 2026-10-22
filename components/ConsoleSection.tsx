"use client";

import React, { useState, useEffect } from "react";
import { IdeaBlueprint, ClarifyingQuestion, StepReviewResult } from "@/types/blueprint";
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
} from "lucide-react";
import { RoadmapGraph } from "@/components/RoadmapGraph";

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
};

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
  const [savedReviews, setSavedReviews] = useState<Record<string, StepReviewResult>>({});
  const [activeTab, setActiveTab] = useState<"roadmap" | "pitfalls" | "stack" | "prompt">("roadmap");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  useEffect(() => {
    const saved = loadSession();
    if (saved.rawIdea && !inputText) {
      setInputText(saved.rawIdea);
    }
    if (saved.userChoices && Object.keys(saved.userChoices).length > 0) {
      setUserChoices(saved.userChoices);
    }
    if (saved.completedNodeIds && saved.completedNodeIds.length > 0) {
      setCompletedNodeIds(saved.completedNodeIds);
    }
    if (saved.reviews) {
      setSavedReviews(saved.reviews);
    }
  }, []);

  const handleToggleNode = (nodeId: string) => {
    setCompletedNodeIds((prev) => {
      const updated = prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId];
      saveSession({ completedNodeIds: updated });
      return updated;
    });
  };

  const handleSaveReview = (stepId: string, review: StepReviewResult) => {
    const updated = { ...savedReviews, [stepId]: review };
    setSavedReviews(updated);
    saveSession({ reviews: updated });
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
              const rec = q.options.find((o: any) => o.recommendation) || q.options[0];
              defaults[q.id] = rec.id;
            }
          });
          setUserChoices(defaults);
          return;
        }
      }
    } catch {
      // Fallback below
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

    // Ensure questions and defaults exist
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

    setCompletedNodeIds([]);
    setActiveTab("roadmap");
    onBreakdown(inputText, currentChoices);

    // Scroll to results once loading finishes
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
    setSavedReviews({});
    clearSession();
    onClear();
  };

  return (
    <section className="craft-section" id="console">
      <div className="section-eyebrow">03 / LIVE INTERACTIVE CONSOLE</div>

      <h2 className="section-headline">
        Break down your idea. <em>Right here.</em>
      </h2>

      <div className={`craft-console-box ${isLoading ? "is-loading" : ""}`}>
        <div className="console-meta-strip">
          <span>⚡ AI ARCHITECT ENGINE // yourdev</span>
          <span>AUTONOMOUS SPECIFICATION STUDIO</span>
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
            onClick={() => handleSelectPreset("flashcards")}
            disabled={isLoading}
          >
            + Spaced Flashcards
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
                <span>Synthesizing Architecture...</span>
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
            <span>{showCustomizer ? "Hide Constraints" : "Calibrate Constraints"}</span>
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

        {/* OPTIONAL ARCHITECTURAL CALIBRATION */}
        {showCustomizer && questions && questions.length > 0 && (
          <div className="coaching-card-wrap" style={{ marginTop: "20px" }}>
            <div className="coaching-step-badge">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architectural Constraints (Optional Tuning)</span>
            </div>

            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "22px",
                fontWeight: 400,
                marginBottom: "4px",
              }}
            >
              Fine-tune your technical boundaries
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                marginBottom: "16px",
              }}
            >
              Adjusting these calibrates your Phase 1 MVP cutline:
            </p>

            {questions.map((q) => (
              <div key={q.id} className="coaching-question-block">
                <div className="coaching-question-title">{q.title}</div>
                <div className="coaching-question-helper">{q.helper}</div>
                <div className="coaching-options-grid">
                  {q.options.map((opt) => {
                    const isSelected = userChoices[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`coaching-option-pill ${
                          isSelected ? "is-selected" : ""
                        }`}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              </div>
            ))}
          </div>
        )}

        {/* ANIMATED LOADING SHIMMER CARD */}
        {isLoading && (
          <div className="craft-loader-card" id="loader-indicator">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
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
                ✦ SYNTHESIZING SYSTEM ARCHITECTURE...
              </p>
            </div>
            <p style={{ fontSize: "13.5px", color: "var(--text)", marginBottom: "14px", lineHeight: 1.5 }}>
              Analyzing domain requirements, sizing Phase 1 MVP boundaries, extracting common pitfalls, and generating your code-ready agent prompt...
            </p>

            {/* Pulsing Step Indicators */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontFamily: "var(--mono)", background: "#fff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #fed7aa", color: "#9a3412" }}>
                ✓ Domain & Entity Extraction
              </span>
              <span style={{ fontSize: "11px", fontFamily: "var(--mono)", background: "#fff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #fed7aa", color: "#9a3412", animation: "pulse 1.2s infinite" }}>
                ✦ Proof-of-Concept Cutline
              </span>
              <span style={{ fontSize: "11px", fontFamily: "var(--mono)", background: "#fff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #fed7aa", color: "#9a3412" }}>
                ✦ Agent Prompt Synthesis
              </span>
            </div>
          </div>
        )}

        {/* DYNAMIC BLUEPRINT STAGE */}
        {!isLoading && blueprint && (
          <div className="blueprint-stage" id="blueprint-results">
            <div className="blueprint-stage-head">
              <div style={{ flex: 1, minWidth: "280px" }}>
                <span className="card-kicker">
                  {blueprint.isFallback ? "ENGINE v1.0 // CACHED" : "✦ TAILORED ARCHITECTURE SPEC"}
                </span>
                <h3 style={{ margin: "6px 0 8px" }}>{blueprint.projectTitle}</h3>
                <p style={{ fontSize: "14.5px", lineHeight: "1.55", color: "var(--text-muted)", maxWidth: "700px" }}>
                  {blueprint.summary}
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-craft-secondary"
                  onClick={handleToggleCustomizer}
                  style={{ fontSize: "12px", padding: "9px 16px" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Calibrate Strategy</span>
                </button>
                <button
                  type="button"
                  className="btn-craft-primary"
                  onClick={handleCopyFull}
                  style={{ fontSize: "12px", padding: "9px 18px" }}
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Blueprint</span>
                </button>
              </div>
            </div>

            {/* Strategic Architecture Callout */}
            {blueprint.strategyDecision && (
              <div className="strategy-callout-card">
                <div className="strategy-callout-label">
                  ✦ Strategic Architecture & Proof-of-Concept Cutline
                </div>
                <div className="strategy-callout-text">
                  {blueprint.strategyDecision}
                </div>
              </div>
            )}

            {/* SEGMENTED STUDIO NAVIGATION TABS */}
            <div className="output-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "roadmap"}
                className={`output-tab-btn ${activeTab === "roadmap" ? "is-active" : ""}`}
                onClick={() => setActiveTab("roadmap")}
              >
                <Map className="w-4 h-4 text-emerald-600" />
                <span>Execution Roadmap & Step Prompts</span>
                {blueprint.nodes && blueprint.nodes.length > 0 && (
                  <span style={{ fontSize: "11px", opacity: 0.8, fontFamily: "var(--mono)" }}>
                    ({blueprint.nodes.length} Steps)
                  </span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "pitfalls"}
                className={`output-tab-btn ${activeTab === "pitfalls" ? "is-active" : ""}`}
                onClick={() => setActiveTab("pitfalls")}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Traps & Failure Modes</span>
                {blueprint.pitfalls && blueprint.pitfalls.length > 0 && (
                  <span style={{ fontSize: "11px", opacity: 0.8, fontFamily: "var(--mono)" }}>
                    ({blueprint.pitfalls.length})
                  </span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "stack"}
                className={`output-tab-btn ${activeTab === "stack" ? "is-active" : ""}`}
                onClick={() => setActiveTab("stack")}
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Calibrated Stack & Docs</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "prompt"}
                className={`output-tab-btn ${activeTab === "prompt" ? "is-active" : ""}`}
                onClick={() => setActiveTab("prompt")}
              >
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>Master AI Prompt</span>
              </button>
            </div>

            {/* TAB CONTENT 1: Interactive Visual Roadmap Graph (roadmap.sh style) */}
            {activeTab === "roadmap" && blueprint.nodes && blueprint.nodes.length > 0 && (
              <RoadmapGraph
                nodes={blueprint.nodes}
                ideaText={inputText}
                completedNodeIds={completedNodeIds}
                onToggleNode={handleToggleNode}
                savedReviews={savedReviews}
                onSaveReview={handleSaveReview}
                onShowToast={onShowToast}
              />
            )}

            {/* TAB CONTENT 2: Critical Pitfalls & Traps */}
            {activeTab === "pitfalls" && (
              <div className="blueprint-card-item tile-wide" style={{ background: "#ffffff", color: "var(--text)" }}>
                <div>
                  <div className="card-kicker" style={{ color: "#a82a1e" }}>
                    Critical Failure Modes & Anti-Patterns
                  </div>
                  <h4 className="card-title" style={{ color: "#18191a", marginBottom: "4px" }}>
                    Where Beginners & AI Coding Agents Get Stuck
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Pair-programming failure modes and technical traps specifically guarded for this project:
                  </p>

                  <div className="pitfalls-container">
                    {blueprint.pitfalls && blueprint.pitfalls.length > 0 ? (
                      blueprint.pitfalls.map((pit, idx) => (
                        <div key={idx} className="pitfall-single-item">
                          <div className="pitfall-title">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Trap {idx + 1}: {pit.trap}</span>
                          </div>
                          <div className="pitfall-body">
                            <strong>Why it happens:</strong> {pit.whyItHappens}
                          </div>
                          <div className="pitfall-how-to-avoid">
                            <strong>How to avoid:</strong> {pit.howToAvoid}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        No known high-risk traps detected for this configuration.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Tech Stack & Official Resources */}
            {activeTab === "stack" && (
              <div className="blueprint-tiles-layout" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="blueprint-card-item">
                  <div>
                    <div className="card-kicker">01 · Calibrated Stack</div>
                    <h4 className="card-title">Technology & Rationale</h4>
                    <ul className="card-list-clean">
                      {blueprint.techStack.map((item, idx) => (
                        <li key={idx}>
                          <strong>{item.name}</strong> ({item.category}):{" "}
                          <span>{item.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="blueprint-card-item">
                  <div>
                    <div className="card-kicker">02 · Official References</div>
                    <h4 className="card-title">Verified Official Links</h4>
                    <ul className="card-list-clean">
                      {blueprint.resources.map((res, idx) => (
                        <li key={idx}>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--accent-green)",
                              textDecoration: "underline",
                              fontWeight: 600,
                            }}
                          >
                            {res.title}
                          </a>{" "}
                          — <em>{res.type}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: Master AI Agent Prompt */}
            {activeTab === "prompt" && (
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
                    <div className="card-kicker">End-to-End Pair-Programming Prompt</div>
                    <h4 className="card-title" style={{ margin: 0, color: "#fff" }}>
                      Paste Directly Into Cursor, Claude, or Copilot
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
            )}
          </div>
        )}
      </div>
    </section>
  );
}
