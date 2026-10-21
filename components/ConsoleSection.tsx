"use client";

import React, { useState } from "react";
import { IdeaBlueprint } from "@/types/blueprint";
import { formatBlueprintMarkdown } from "@/lib/clipboard";
import { Check, Copy } from "lucide-react";

interface ConsoleSectionProps {
  blueprint: IdeaBlueprint | null;
  isLoading: boolean;
  onBreakdown: (text: string) => void;
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
  };

  const handleSubmit = () => {
    if (inputText.trim().length < 15) {
      onShowToast("Please enter at least 15 characters.");
      return;
    }
    setCompletedSteps([]);
    onBreakdown(inputText);
  };

  const handleCopyFull = async () => {
    if (!blueprint) return;
    try {
      const markdown = formatBlueprintMarkdown(blueprint);
      await navigator.clipboard.writeText(markdown);
      onShowToast("✓ BLUEPRINT COPIED TO CLIPBOARD");
    } catch {
      onShowToast("Failed to copy blueprint.");
    }
  };

  const handleCopyPrompt = async () => {
    if (!blueprint) return;
    try {
      await navigator.clipboard.writeText(blueprint.agentGuide.firstPrompt);
      onShowToast("✓ FIRST PROMPT COPIED TO CLIPBOARD");
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
          <span>⚡ BREAKDOWN ENGINE // DEVPOST HACKATHON</span>
          <span>DUAL-MODE: LIVE GEMINI + INSTANT OFFLINE FALLBACK</span>
        </div>

        <textarea
          className="craft-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your raw concept here... (e.g. 'I want to build a habit tracker that gives me AI suggestions when I miss a routine')"
        />

        {/* Preset Chips */}
        <div className="craft-presets-row">
          <span style={{ fontSize: "11px", color: "var(--text-soft)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Quick Presets:
          </span>
          <button
            type="button"
            className="craft-preset-chip"
            onClick={() => setPreset("habit")}
          >
            🎯 AI Habit Tracker
          </button>
          <button
            type="button"
            className="craft-preset-chip"
            onClick={() => setPreset("flashcards")}
          >
            🃏 Spaced Flashcards
          </button>
          <button
            type="button"
            className="craft-preset-chip"
            onClick={() => setPreset("events")}
          >
            📍 Dev Event Scraper
          </button>
        </div>

        {/* Actions Bar */}
        <div className="console-actions-bar">
          <button
            type="button"
            className="btn-craft-primary"
            onClick={handleSubmit}
            disabled={isLoading || inputText.trim().length < 15}
          >
            <span>{isLoading ? "Coaching idea..." : "Break it down"}</span>
            <span>→</span>
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

        {/* Shimmer Loader */}
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
              ✦ COACHING INTENT INTO AGENT-READY PHASES...
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Extracting milestones, stack rationales, and exact starter prompts...
            </p>
          </div>
        )}

        {/* Dynamic Blueprint Stage */}
        {!isLoading && blueprint && (
          <div className="blueprint-stage">
            <div className="blueprint-stage-head">
              <div>
                <span className="card-kicker">
                  BLUEPRINT SPECIFICATION // {blueprint.isFallback ? "OFFLINE ENGINE" : "LIVE GEMINI"}
                </span>
                <h3>{blueprint.projectTitle}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "680px" }}>
                  {blueprint.summary}
                </p>
              </div>

              <button
                type="button"
                className="btn-craft-primary"
                onClick={handleCopyFull}
              >
                <Copy className="w-4 h-4" />
                <span>Copy Full Blueprint</span>
              </button>
            </div>

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

              {/* Tile 3: Tech Stack */}
              <div className="blueprint-card-item">
                <div>
                  <div className="card-kicker">03 · Tech Stack</div>
                  <h4 className="card-title">Recommended Stack</h4>
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

              {/* Tile 4: Free Resources */}
              <div className="blueprint-card-item">
                <div>
                  <div className="card-kicker">04 · Free Resources</div>
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

              {/* Tile 5: AI Coding Agent Guide & First Prompt */}
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
                    <div className="card-kicker">05 · Agent First Prompt</div>
                    <h4 className="card-title" style={{ margin: 0, color: "#fff" }}>
                      Paste Directly Into Cursor, Claude, or Copilot
                    </h4>
                  </div>
                  <button
                    type="button"
                    className="btn-craft-secondary"
                    style={{ padding: "8px 16px", fontSize: "11px", background: "#26282b", color: "#fff", borderColor: "#3d4044" }}
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
