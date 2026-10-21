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
      onShowToast("📋 BLUEPRINT COPIED");
    } catch {
      onShowToast("Failed to copy blueprint.");
    }
  };

  const handleCopyPrompt = async () => {
    if (!blueprint) return;
    try {
      await navigator.clipboard.writeText(blueprint.agentGuide.firstPrompt);
      onShowToast("📋 FIRST PROMPT COPIED");
    } catch {
      onShowToast("Failed to copy prompt.");
    }
  };

  return (
    <section className="console-section container-custom" id="console">
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div className="section-number-tag">03 / Live Interactive Console</div>
        <h2 className="editorial-headline" style={{ fontSize: "2.2rem" }}>
          Try the breakdown engine. <em>Right here.</em>
        </h2>
      </div>

      <div className="console-widget">
        <div className="console-top">
          <span className="console-label">⚡ Breakdown Console</span>
          <span className="console-engine-tag">
            {blueprint?.isFallback
              ? "SMART OFFLINE FALLBACK ENGINE"
              : "DUAL-MODE: LIVE GEMINI + OFFLINE"}
          </span>
        </div>

        <textarea
          id="promptInput"
          className="console-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your messy idea here... (e.g. 'I want to build a fitness tracker that gives me smart AI encouragement when I hit a 7-day streak')"
        />

        <div className="chip-row">
          <span className="chip-label">Try a preset:</span>
          <button
            type="button"
            className="chip"
            onClick={() => setPreset("habit")}
          >
            🎯 AI Habit Tracker
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => setPreset("flashcards")}
          >
            🃏 Spaced Flashcards
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => setPreset("events")}
          >
            📍 Dev Event Scraper
          </button>
        </div>

        <div className="action-row">
          <button
            id="breakdownBtn"
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || inputText.trim().length < 15}
          >
            <span>{isLoading ? "Coaching idea..." : "Break it down"}</span>
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setInputText("");
              onClear();
            }}
          >
            Clear
          </button>
        </div>

        {/* Shimmering Loader */}
        {isLoading && (
          <div id="loaderBox" className="loader-box">
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.82rem",
                color: "var(--accent)",
                marginBottom: "0.4rem",
              }}
            >
              ✦ COACHING INTENT INTO AGENT-READY PHASES...
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-mute)" }}>
              Structuring milestones, stack rationales, and first prompts...
            </p>
          </div>
        )}

        {/* Dynamic Results Tiles */}
        {!isLoading && blueprint && (
          <div
            id="resultsWrap"
            className="results-container"
            style={{ display: "block" }}
          >
            <div className="results-head">
              <div>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.3rem",
                  }}
                >
                  Generated Agent Blueprint: {blueprint.projectTitle}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>
                  {blueprint.summary}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={handleCopyFull}
              >
                <span>📋</span> Copy Full Blueprint
              </button>
            </div>

            <div className="tiles-grid">
              {/* Tile 1: Roadmap */}
              <div className="tile tile-1">
                <p className="tile-tag">01 · Roadmap</p>
                <h4 className="tile-title">Phased Milestones</h4>
                <ul className="tile-list">
                  {blueprint.roadmap.map((phase, idx) => (
                    <li key={idx}>
                      <strong>{phase.phase}:</strong> {phase.title} —{" "}
                      <span style={{ color: "var(--text-mute)" }}>
                        {phase.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tile 2: Actions */}
              <div className="tile tile-2">
                <p className="tile-tag">02 · Actions</p>
                <h4 className="tile-title">Immediate Next Steps</h4>
                <ul className="tile-list">
                  {blueprint.nextActions.map((action) => (
                    <li key={action.step}>
                      <strong>Step {action.step}:</strong> {action.action} —{" "}
                      <span style={{ color: "var(--text-mute)" }}>
                        {action.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tile 3: Tech Stack */}
              <div className="tile tile-3">
                <p className="tile-tag">03 · Tech Stack</p>
                <h4 className="tile-title">Recommended Stack</h4>
                <ul className="tile-list">
                  {blueprint.techStack.map((item, idx) => (
                    <li key={idx}>
                      <strong>
                        {item.name} ({item.category}):
                      </strong>{" "}
                      {item.reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tile 4: Resources */}
              <div className="tile tile-4">
                <p className="tile-tag">04 · Resources</p>
                <h4 className="tile-title">Free Learning Links</h4>
                <ul className="tile-list">
                  {blueprint.resources.map((res, idx) => (
                    <li key={idx}>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--accent)",
                          textDecoration: "underline",
                        }}
                      >
                        <strong>{res.title}</strong>
                      </a>{" "}
                      — <em>{res.type}</em>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tile 5: First Prompt Box */}
              <div className="tile-full tile-5">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <p
                    className="tile-tag"
                    style={{ color: "var(--accent)", margin: 0 }}
                  >
                    05 · First Prompt to Use in Your Coding Agent
                  </p>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }}
                    onClick={handleCopyPrompt}
                  >
                    Copy Prompt
                  </button>
                </div>
                <div id="firstPromptCode" className="prompt-box">
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
