"use client";

import React from "react";

const OUTPUT_ITEMS = [
  {
    tag: "01 · ROADMAP",
    title: "Phased Roadmap",
    desc: "3–5 sequential milestones from skeleton to polish. Each phase is scoped to a single verifiable commit an agent can build independently.",
  },
  {
    tag: "02 · ACTIONS",
    title: "Immediate Next Actions",
    desc: "4–6 concrete steps with clear action verbs. Tells you exactly what file to touch first so you never stare at a blank prompt.",
  },
  {
    tag: "03 · TECH STACK",
    title: "Recommended Tech Stack",
    desc: "Zero-friction, modern tools chosen for speed and agent compatibility. Plain-English rationales for every architectural choice.",
  },
  {
    tag: "04 · RESOURCES",
    title: "Free Learning Resources",
    desc: "Targeted official documentation and verified interactive tutorials. 100% free with zero paywalled courses.",
  },
  {
    tag: "05 · AGENT GUIDE",
    title: "AI Agent Guide",
    desc: "Practical paired-programming rules — what to verify, boundary enforcement, and how to handle edge-case errors cleanly.",
  },
  {
    tag: "06 · STARTER PROMPT",
    title: "First Agent Prompt",
    desc: "The exact starter prompt to kick off Phase 1 in your coding agent. One click to copy, paste into your chat, and begin.",
  },
];

export function OutputSection() {
  return (
    <section className="craft-section" id="output">
      <div className="section-eyebrow">04 / THE OUTPUT SPECIFICATION</div>

      <h2 className="section-headline">
        Five sections.<br />
        <em>One agent-ready document.</em>
      </h2>

      <p className="craft-hero-desc" style={{ marginBottom: "24px" }}>
        Every generated blueprint is structured so modern coding agents can build milestone by milestone
        without hallucinating or drifting out of scope.
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
