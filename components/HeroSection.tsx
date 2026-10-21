"use client";

import React from "react";

// 24 bars simulating the visual roadmap timeline (like GapWitness's 24-hour observation strip)
const SPECIMEN_BARS = [
  { height: 60, isMissing: false },
  { height: 80, isMissing: false },
  { height: 45, isMissing: false },
  { height: 95, isMissing: false },
  { height: 70, isMissing: false },
  { height: 50, isMissing: false },
  { height: 85, isMissing: false },
  { height: 0, isMissing: true },
  { height: 90, isMissing: false },
  { height: 65, isMissing: false },
  { height: 75, isMissing: false },
  { height: 55, isMissing: false },
  { height: 0, isMissing: true },
  { height: 85, isMissing: false },
  { height: 70, isMissing: false },
  { height: 95, isMissing: false },
  { height: 60, isMissing: false },
  { height: 80, isMissing: false },
  { height: 0, isMissing: true },
  { height: 75, isMissing: false },
  { height: 90, isMissing: false },
  { height: 65, isMissing: false },
  { height: 85, isMissing: false },
  { height: 100, isMissing: false },
];

export function HeroSection() {
  return (
    <section className="landing-hero" id="hero">
      {/* Left Copy */}
      <div className="landing-hero-copy">
        <div className="landing-eyebrow">
          <span className="eyebrow-dot"></span>
          <span>BEGINNER BUILDERS · AI AGENT WORKFLOWS</span>
        </div>

        <h1>
          Messy ideas in.<br />
          <em>Agent-ready blueprints out.</em>
        </h1>

        <p className="landing-intro">
          A precision editorial console for new developers overwhelmed by blank IDEs.
          Transform chaotic thoughts into structured, executable roadmaps — phased milestones,
          verified tech stacks, free resources, and your exact first agent prompt.
        </p>

        <div className="landing-actions">
          <a href="#console" className="landing-button">
            <span>Try the breakdown console</span>
            <span>→</span>
          </a>
          <a href="#output" className="landing-text-link">
            Inspect the 5 output sections
          </a>
        </div>

        <p className="landing-caption">
          Built for Devpost: Build With AI Basics 2026 · Zero paid API keys required
        </p>
      </div>

      {/* Right Column: GapWitness Specimen Paper Card */}
      <aside className="landing-specimen" aria-label="Sample Project Blueprint Specimen">
        <div className="specimen-heading">
          <span>SPECIMEN // 01</span>
          <span>HABIT TRACKER BLUEPRINT</span>
          <span className="specimen-verdict">VERDICT: AGENT READY</span>
        </div>

        <div className="specimen-title">
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              TARGET MILESTONE MAP
            </p>
            <h2>Adaptive Streak Tracker</h2>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--green-accent)", fontWeight: 600 }}>
            v0.1.0-poc
          </span>
        </div>

        {/* 24-Unit Visual Strip */}
        <div className="specimen-chart" role="img" aria-label="Phase sequence timeline">
          {SPECIMEN_BARS.map((bar, idx) => (
            <div
              key={idx}
              className={`specimen-hour ${bar.isMissing ? "is-missing" : ""}`}
            >
              {!bar.isMissing && (
                <span style={{ height: `${bar.height}%` }} />
              )}
            </div>
          ))}
        </div>

        <div className="specimen-axis">
          <span>PHASE 1: SCAFFOLD</span>
          <span>PHASE 2: ACTIONS</span>
          <span>PHASE 3: POLISH</span>
        </div>

        <div className="specimen-key">
          <span><i></i> Verified Milestone</span>
          <span><i></i> Friction Point (Handled)</span>
        </div>

        {/* 3 Metric Stats */}
        <div className="specimen-stats">
          <div>
            <strong>04</strong>
            <span>Phased Milestones</span>
          </div>
          <div>
            <strong>05</strong>
            <span>Immediate Actions</span>
          </div>
          <div>
            <strong>$0</strong>
            <span>Setup Cost</span>
          </div>
        </div>

        <p className="specimen-note">
          &ldquo;Turn raw brainstorms into an execution roadmap before you touch code.&rdquo;
        </p>
      </aside>
    </section>
  );
}
