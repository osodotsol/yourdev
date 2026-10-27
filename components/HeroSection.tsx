"use client";

import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { PillarsBar } from "@/components/PillarsBar";

const MILESTONES = [
  { step: "01", title: "Habit data model", state: "done" },
  { step: "02", title: "Habit row UI", state: "done" },
  { step: "03", title: "Save between visits", state: "current" },
  { step: "04", title: "Streaks & badges", state: "next" },
] as const;

const INITIAL_CHECKS = [
  { id: "persist", text: "Habits survive a page reload", done: true },
  { id: "empty", text: "Empty list shows a friendly prompt, not an error", done: false },
  { id: "console", text: "No errors in the browser console on localhost", done: false },
];

export function HeroSection() {
  const [checks, setChecks] = useState(INITIAL_CHECKS);

  const toggle = (id: string) => {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  };

  const doneCount = checks.filter((c) => c.done).length;
  const isReady = doneCount === checks.length;

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="label hero-kicker">A guided build environment for first-time developers</p>

        <h1 id="hero-title">
          Build real software.<br />
          <em>From idea to verified code.</em>
        </h1>

        <p className="hero-lede">
          YourDev turns a rough idea into a bounded plan: four milestones, a few files each,
          a definition of done, and the exact prompt to hand your AI coding agent. Then it
          checks each step before you move on.
        </p>

        <div className="hero-actions">
          <a href="#console" className="btn btn-primary btn-lg">
            Break down an idea
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
          <a href="#output" className="btn btn-secondary btn-lg">
            Inspect output blueprint
          </a>
        </div>

        <PillarsBar />
      </div>

      {/* A worked blueprint, shown as the document YourDev actually produces */}
      <figure className="specimen" aria-label="Example blueprint for a habit tracker">
        <div className="specimen-head">
          <span className="label">blueprint / habit-tracker</span>
          <span className={`status ${isReady ? "status-done" : "status-progress"}`}>
            {isReady ? "Ready for review" : "Step 3 in progress"}
          </span>
        </div>

        <div className="specimen-idea">
          <span className="label">The idea, as typed</span>
          <blockquote>
            &ldquo;A habit tracker that reminds me every day and gives me a badge when I hit a
            7-day streak.&rdquo;
          </blockquote>
        </div>

        <ol className="specimen-rail" aria-label="Milestones">
          {MILESTONES.map((m) => (
            <li
              key={m.step}
              data-state={m.state}
              className={m.state === "current" && isReady ? "is-ready" : undefined}
              aria-current={m.state === "current" ? "step" : undefined}
            >
              <span className="rail-num">
                {m.state === "done" && <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />}
                {m.step}
                <span className="sr-only">
                  {m.state === "done" ? " (verified)" : m.state === "current" ? " (current)" : " (up next)"}
                </span>
              </span>
              {m.title}
            </li>
          ))}
        </ol>

        <div className="specimen-step">
          <div className="specimen-step-head">
            <h3>Save habits between visits</h3>
            <span className="label">~60 min · 2 files</span>
          </div>
          <div className="specimen-files">
            <code className="file-chip">hooks/useHabits.ts</code>
            <code className="file-chip">lib/storage.ts</code>
          </div>

          <span className="label">Definition of done: try ticking these off</span>
          <ul className="checklist">
            {checks.map((c) => (
              <li key={c.id}>
                <label>
                  <input type="checkbox" checked={c.done} onChange={() => toggle(c.id)} />
                  <span>{c.text}</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="specimen-status" aria-live="polite">
            <span>
              {doneCount} of {checks.length} checks passing
            </span>
            <span className={`meter ${isReady ? "is-complete" : ""}`} aria-hidden="true">
              <span style={{ width: `${(doneCount / checks.length) * 100}%` }} />
            </span>
          </div>
        </div>

        <figcaption className="specimen-mentor">
          <img
            src="/images/devi-avatar-128.jpg"
            alt=""
            width={40}
            height={40}
            className="avatar"
          />
          <p>
            <strong>Devi, your mentor</strong>
            <br />
            {isReady
              ? "All checks pass. Paste your console output and I’ll review it before step 4 unlocks."
              : "Run it on localhost first. I’ll check your work against this list before step 4 unlocks."}
          </p>
        </figcaption>
      </figure>
    </section>
  );
}
