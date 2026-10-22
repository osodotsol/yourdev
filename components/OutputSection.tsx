"use client";

import React from "react";

const OUTPUT_ITEMS = [
  {
    tag: "01 · ROADMAP",
    title: "Visual Execution Tree",
    desc: "4 sequential milestones from data contracts to polish. Each node has exact files to create, verified docs, and an agent prompt.",
  },
  {
    tag: "02 · VERIFICATION",
    title: "Per-Step Mentor Review",
    desc: "Submit your code or test logs at each milestone to receive instant AI mentor critique, approval checks, and guidance.",
  },
  {
    tag: "03 · PITFALLS",
    title: "Failure Modes & Traps",
    desc: "Guards against domain-specific beginner traps (e.g., manifest permissions, hydration mismatches, premature auth).",
  },
  {
    tag: "04 · TECH STACK",
    title: "Calibrated Architecture",
    desc: "Carefully chosen framework, language, and persistence tools with plain-English rationales for every technical trade-off.",
  },
  {
    tag: "05 · PROMPTS",
    title: "Single-Slice & Master Prompts",
    desc: "Copy either a milestone-specific prompt or the master blueprint prompt directly into Cursor, Claude, or Copilot.",
  },
  {
    tag: "06 · PERSISTENCE",
    title: "Local State Reliability",
    desc: "100% offline-first session persistence. Your progress, choices, and reviews are saved across page reloads.",
  },
];

export function OutputSection() {
  return (
    <section className="craft-section" id="output">
      <div className="section-eyebrow">04 / THE OUTPUT SPECIFICATION</div>

      <h2 className="section-headline">
        Four studio views.<br />
        <em>One actionable mentor roadmap.</em>
      </h2>

      <p className="craft-hero-desc" style={{ marginBottom: "24px" }}>
        Every generated blueprint is structured so beginners can build milestone by milestone with continuous verification, avoiding hallucination and scope drift.
      </p>

      <div className="craft-output-grid">
        {OUTPUT_ITEMS.map((item) => (
          <div key={item.tag} className="output-feature-card">
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--accent-green)",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: "12px",
              }}
            >
              {item.tag}
            </span>
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
