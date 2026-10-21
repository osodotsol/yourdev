"use client";

import React, { useState } from "react";
import { IdeaBlueprint, ClarifyingQuestion } from "@/types/blueprint";
import { formatBlueprintMarkdown } from "@/lib/clipboard";
import { getClarifyingQuestions } from "@/lib/fallbackGenerator";
import {
  Check,
  Copy,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const handleSelectPreset = (key: keyof typeof PRESETS) => {
    const text = PRESETS[key];
    setInputText(text);
    const qs = getClarifyingQuestions(text);
    setQuestions(qs);
    const defaults: Record<string, string> = {};
    qs.forEach((q) => {
      const rec = q.options.find((o) => o.recommendation) || q.options[0];
      defaults[q.id] = rec.id;
    });
    setUserChoices(defaults);
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

    setCompletedSteps([]);
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
      const qs = getClarifyingQuestions(inputText);
      setQuestions(qs);
      const defaults: Record<string, string> = {};
      qs.forEach((q) => {
        const rec = q.options.find((o) => o.recommendation) || q.options[0];
        defaults[q.id] = rec.id;
      });
      setUserChoices(defaults);
    }
    setShowCustomizer((prev) => !prev);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserChoices((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
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
          <span>POWERED BY GOOGLE GEMINI 1.5</span>
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
                <span>Architecting with Gemini AI...</span>
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
              Adjusting these tells Gemini how to size your Phase 1 MVP cutline:
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
                ✦ CONSULTING GOOGLE GEMINI 1.5 ARCHITECT...
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
              <div>
                <span className="card-kicker">
                  {blueprint.isFallback ? "OFFLINE ENGINE BACKUP" : "✦ LIVE GEMINI AI STRATEGY"}
                </span>
                <h3>{blueprint.projectTitle}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "680px" }}>
                  {blueprint.summary}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-craft-secondary"
                  onClick={handleToggleCustomizer}
                  style={{ fontSize: "12px" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Calibrate Strategy</span>
                </button>
                <button
                  type="button"
                  className="btn-craft-primary"
                  onClick={handleCopyFull}
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

            <div className="blueprint-tiles-layout">
              {/* Tile 1: Roadmap */}
              <div className="blueprint-card-item">
                <div>
                  <div className="card-kicker">01 · Phased Roadmap</div>
                  <h4 className="card-title">Sequential Milestones</h4>
                  <ul className="card-list-clean">
                    {blueprint.roadmap.map((phase, idx) => (
                      <li key={idx}>
                        <strong>{phase.phase}:</strong> {phase.title} —{" "}
                        <span>{phase.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tile 2: Interactive Next Actions Checklist */}
              <div className="blueprint-card-item">
                <div>
                  <div className="card-kicker">02 · Immediate Next Actions</div>
                  <h4 className="card-title">Interactive Checklist (Click to tick)</h4>
                  <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                    {blueprint.nextActions.map((action) => {
                      const isDone = completedSteps.includes(action.step);
                      return (
                        <div
                          key={action.step}
                          className="stage-task-row"
                          onClick={() => toggleStep(action.step)}
                        >
                          <div
                            className={`stage-task-checkbox ${
                              isDone ? "is-checked" : ""
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`stage-task-text ${
                              isDone ? "is-done" : ""
                            }`}
                          >
                            <strong>Step {action.step}:</strong> {action.action}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tile 3: Where Beginners Get Stuck (Pitfalls & Traps) */}
              <div className="blueprint-card-item tile-wide" style={{ background: "#ffffff", color: "var(--text)" }}>
                <div>
                  <div className="card-kicker" style={{ color: "#a82a1e" }}>
                    03 · Where Beginners Get Stuck (Pitfalls & Traps)
                  </div>
                  <h4 className="card-title" style={{ color: "#18191a", marginBottom: "4px" }}>
                    Critical Failure Modes for this Specific Project
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Pair-programming failure modes and technical traps to guard your coding agent against:
                  </p>

                  <div className="pitfalls-container">
                    {blueprint.pitfalls && blueprint.pitfalls.length > 0 ? (
                      blueprint.pitfalls.map((pit, idx) => (
                        <div key={idx} className="pitfall-single-item">
                          <div className="pitfall-title">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
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

              {/* Tile 4: Tech Stack */}
              <div className="blueprint-card-item">
                <div>
                  <div className="card-kicker">04 · Tech Stack</div>
                  <h4 className="card-title">Calibrated Stack & Rationale</h4>
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

              {/* Tile 5: Free Resources */}
              <div className="blueprint-card-item">
                <div>
                  <div className="card-kicker">05 · Free Resources</div>
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

              {/* Tile 6: AI Coding Agent Guide & First Prompt */}
              <div className="blueprint-card-item tile-wide">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div className="card-kicker">06 · Agent First Prompt</div>
                    <h4 className="card-title" style={{ margin: 0, color: "#fff" }}>
                      Paste Directly Into Cursor, Claude, or Copilot
                    </h4>
                  </div>
                  <button
                    type="button"
                    className="btn-craft-secondary"
                    style={{
                      padding: "8px 16px",
                      fontSize: "11px",
                      background: "#26282b",
                      color: "#fff",
                      borderColor: "#3d4044",
                    }}
                    onClick={handleCopyPrompt}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </button>
                </div>
                <pre className="prompt-terminal">
                  {blueprint.agentGuide.firstPrompt}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
