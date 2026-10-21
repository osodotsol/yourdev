"use client";

import React, { useState } from "react";
import { IdeaBlueprint } from "@/types/blueprint";
import { formatBlueprintMarkdown } from "@/lib/clipboard";

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

  const setPreset = (key: keyof typeof PRESETS) => {
    setInputText(PRESETS[key]);
  };

  const handleSubmit = () => {
    if (inputText.trim().length < 15) {
      onShowToast("Please enter at least 15 characters.");
      return;
    }
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
    <section className="landing-section" id="console">
      <div className="landing-eyebrow">
        <span className="eyebrow-dot"></span>
        <span>03 / LIVE INTERACTIVE CONSOLE</span>
      </div>

      <h2>
        Try the breakdown engine. <em>Right here.</em>
      </h2>

      <div className="console-paper">
        <div className="console-heading-strip">
          <span>⚡ BREAKDOWN ENGINE // SPECIFICATION READY</span>
          <span>DUAL-MODE: LIVE GEMINI + INSTANT OFFLINE FALLBACK</span>
        </div>

        <textarea
          className="console-textarea-paper"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your messy idea here... (e.g. 'I want to build a fitness tracker that gives me smart AI encouragement when I hit a 7-day streak')"
        />

        {/* Preset Chips */}
        <div className="preset-chip-row">
          <span className="preset-chip-label">Try a preset:</span>
          <button
            type="button"
            className="preset-chip-btn"
            onClick={() => setPreset("habit")}
          >
            🎯 AI Habit Tracker
          </button>
          <button
            type="button"
            className="preset-chip-btn"
            onClick={() => setPreset("flashcards")}
          >
            🃏 Spaced Flashcards
          </button>
          <button
            type="button"
            className="preset-chip-btn"
            onClick={() => setPreset("events")}
          >
            📍 Dev Event Scraper
          </button>
        </div>

        {/* Actions */}
        <div className="console-action-bar">
          <button
            type="button"
            className="btn-paper-primary"
            onClick={handleSubmit}
            disabled={isLoading || inputText.trim().length < 15}
          >
            <span>{isLoading ? "Coaching idea..." : "Break it down"}</span>
            <span>→</span>
          </button>
          <button
            type="button"
            className="btn-paper-clear"
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
          <div className="console-loader-paper">
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--gold-accent)",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              ✦ COACHING INTENT INTO AGENT-READY PHASES...
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              Structuring milestones, stack rationales, and first prompts...
            </p>
          </div>
        )}

        {/* Dynamic Results Tiles */}
        {!isLoading && blueprint && (
          <div className="blueprint-paper-wrap">
            <div className="blueprint-header-bar">
              <div>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "9px",
                    color: "var(--text-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  GENERATED SPECIFICATION // {blueprint.isFallback ? "OFFLINE ENGINE" : "GEMINI AI"}
                </p>
                <h3>{blueprint.projectTitle}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "680px" }}>
                  {blueprint.summary}
                </p>
              </div>

              <button
                type="button"
                className="btn-paper-primary"
                onClick={handleCopyFull}
              >
                <span>📋 Copy Full Blueprint</span>
              </button>
            </div>

            <div className="blueprint-tiles-grid">
              {/* Tile 1: Roadmap */}
              <div className="blueprint-tile-card">
                <div>
                  <div className="tile-mono-tag">01 · Phased Roadmap</div>
                  <h4 className="tile-serif-title">Sequential Milestones</h4>
                  <ul className="tile-item-list">
                    {blueprint.roadmap.map((phase, idx) => (
                      <li key={idx}>
                        <strong>{phase.phase}:</strong> {phase.title} —{" "}
                        <span>{phase.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tile 2: Actions */}
              <div className="blueprint-tile-card">
                <div>
                  <div className="tile-mono-tag">02 · Immediate Actions</div>
                  <h4 className="tile-serif-title">Next Steps to Execute</h4>
                  <ul className="tile-item-list">
                    {blueprint.nextActions.map((action) => (
                      <li key={action.step}>
                        <strong>Step {action.step}:</strong> {action.action} —{" "}
                        <span>{action.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tile 3: Tech Stack */}
              <div className="blueprint-tile-card">
                <div>
                  <div className="tile-mono-tag">03 · Tech Stack</div>
                  <h4 className="tile-serif-title">Recommended Tools</h4>
                  <ul className="tile-item-list">
                    {blueprint.techStack.map((item, idx) => (
                      <li key={idx}>
                        <strong>{item.name}</strong> ({item.category}):{" "}
                        <span>{item.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tile 4: Resources */}
              <div className="blueprint-tile-card">
                <div>
                  <div className="tile-mono-tag">04 · Free Resources</div>
                  <h4 className="tile-serif-title">Targeted Learning Links</h4>
                  <ul className="tile-item-list">
                    {blueprint.resources.map((res, idx) => (
                      <li key={idx}>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "var(--green-primary)",
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

              {/* Tile 5: First Prompt */}
              <div className="blueprint-tile-card tile-full">
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
                    <div className="tile-mono-tag" style={{ color: "var(--green-accent)" }}>
                      05 · Agent First Prompt
                    </div>
                    <h4 className="tile-serif-title" style={{ margin: 0 }}>
                      Copy Directly Into Your Coding Agent
                    </h4>
                  </div>
                  <button
                    type="button"
                    className="btn-paper-clear"
                    style={{ padding: "8px 14px", fontSize: "10px" }}
                    onClick={handleCopyPrompt}
                  >
                    Copy Prompt
                  </button>
                </div>
                <div className="prompt-paper-box">
                  {blueprint.agentGuide.firstPrompt}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
