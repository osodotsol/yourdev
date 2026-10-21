"use client";

import React, { useState } from "react";
import { IdeaBlueprint, ClarifyingQuestion } from "@/types/blueprint";
import { formatBlueprintMarkdown } from "@/lib/clipboard";
import { getClarifyingQuestions } from "@/lib/fallbackGenerator";
import { Check, Copy, ArrowRight, ArrowLeft, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";

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
  const [inputText, setInputText] = useState(PRESETS.habit);
  const [step, setStep] = useState<"input" | "coaching" | "blueprint">("blueprint");
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [userChoices, setUserChoices] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const setPreset = (key: keyof typeof PRESETS) => {
    setInputText(PRESETS[key]);
    setStep("input");
  };

  const handleStartCoaching = () => {
    if (inputText.trim().length < 15) {
      onShowToast("Please enter at least 15 characters to analyze.");
      return;
    }
    const qs = getClarifyingQuestions(inputText);
    setQuestions(qs);

    // Pre-select recommended options
    const defaults: Record<string, string> = {};
    qs.forEach((q) => {
      const rec = q.options.find((o) => o.recommendation) || q.options[0];
      defaults[q.id] = rec.id;
    });
    setUserChoices(defaults);
    setStep("coaching");

    const consoleEl = document.getElementById("console");
    if (consoleEl) {
      consoleEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserChoices((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleGenerateFinal = () => {
    setCompletedSteps([]);
    onBreakdown(inputText, userChoices);
    setStep("blueprint");
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

  return (
    <section className="craft-section" id="console">
      <div className="section-eyebrow">03 / LIVE INTERACTIVE CONSOLE</div>

      <h2 className="section-headline">
        Break down your idea. <em>Right here.</em>
      </h2>

      <div className="craft-console-box">
        <div className="console-meta-strip">
          <span>⚡ FLIPPED INTERACTION COACH // yourdev</span>
          <span>
            {step === "coaching"
              ? "STEP 2 OF 2: ARCHITECTURAL CALIBRATION"
              : step === "input"
              ? "STEP 1 OF 2: DESCRIBE RAW IDEA"
              : "STRATEGIC EXECUTION BLUEPRINT"}
          </span>
        </div>

        {/* STEP 1: IDEA INPUT */}
        {step === "input" && (
          <div>
            <textarea
              className="craft-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your raw concept here... (e.g. 'I want to build a Chrome extension that highlights and saves recipe ingredients from blogs with zero cloud database')"
            />

            {/* Preset Chips */}
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
                Quick Presets:
              </span>
              <button
                type="button"
                className="craft-preset-chip"
                onClick={() => setPreset("habit")}
              >
                + Habit Tracker
              </button>
              <button
                type="button"
                className="craft-preset-chip"
                onClick={() => setPreset("flashcards")}
              >
                + Spaced Flashcards
              </button>
              <button
                type="button"
                className="craft-preset-chip"
                onClick={() => setPreset("events")}
              >
                + Dev Event Scraper
              </button>
            </div>

            {/* Actions Bar */}
            <div className="console-actions-bar">
              <button
                type="button"
                className="btn-craft-primary"
                onClick={handleStartCoaching}
                disabled={isLoading || inputText.trim().length < 15}
              >
                <span>Analyze Idea & Clarify Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="btn-craft-secondary"
                onClick={() => {
                  setInputText("");
                  onClear();
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INTERACTIVE COACHING QUESTIONS */}
        {step === "coaching" && (
          <div className="coaching-card-wrap">
            <div className="coaching-step-badge">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 2 of 2 · Flipped Architecture Calibration</span>
            </div>

            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "26px",
                fontWeight: 400,
                marginBottom: "6px",
              }}
            >
              Let’s calibrate your strategy before building.
            </h3>
            <p
              style={{
                fontSize: "13.5px",
                color: "var(--text-muted)",
                marginBottom: "20px",
              }}
            >
              A senior engineer would ask these exact questions to keep your Demo Day project focused,
              avoiding weeks of wasted refactoring:
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "28px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn-craft-primary"
                onClick={handleGenerateFinal}
                disabled={isLoading}
              >
                <span>Generate Tailored Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="btn-craft-secondary"
                onClick={() => setStep("input")}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Idea</span>
              </button>
            </div>
          </div>
        )}

        {/* LOADING SHIMMER */}
        {isLoading && (
          <div className="craft-loader-card">
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--accent-gold)",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              ✦ SYNTHESIZING TAILORED ARCHITECTURE & PITFALL SAFEGUARDS...
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Applying your chosen constraints into concrete milestones, pitfalls to avoid, and exact starter prompts...
            </p>
          </div>
        )}

        {/* STEP 3: DYNAMIC BLUEPRINT STAGE */}
        {!isLoading && step === "blueprint" && blueprint && (
          <div className="blueprint-stage">
            <div className="blueprint-stage-head">
              <div>
                <span className="card-kicker">
                  TAILORED STRATEGY // {blueprint.isFallback ? "OFFLINE ENGINE" : "LIVE GEMINI"}
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
                  onClick={() => setStep("coaching")}
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
