"use client";

import React from "react";

export function OutputSection() {
  return (
    <section className="craft-section" id="output">
      <div className="section-eyebrow">04 / THE OUTPUT SPECIFICATION</div>

      <h2 className="section-headline">
        Five sections.<br />
        <em>One agent-ready document.</em>
      </h2>

      <p className="craft-hero-desc" style={{ marginBottom: "20px" }}>
        Every generated blueprint is structured so modern coding agents can build milestone by milestone
        without hallucinating or drifting out of scope.
      </p>

      <div className="craft-output-grid">
        <div className="output-feature-card">
          <div className="card-icon">🗺️</div>
          <h4>Phased Roadmap</h4>
          <p>
            3–5 sequential milestones from skeleton to polish. Each phase is scoped to a
            single verifiable commit an agent can build independently.
          </p>
        </div>

        <div className="output-feature-card">
          <div className="card-icon">⚡</div>
          <h4>Immediate Next Actions</h4>
          <p>
            4–6 concrete steps with clear action verbs. Tells you exactly what file to touch
            first so you never stare at a blank prompt.
          </p>
        </div>

        <div className="output-feature-card">
          <div className="card-icon">🧱</div>
          <h4>Recommended Tech Stack</h4>
          <p>
            Zero-friction, modern tools chosen for speed and agent compatibility. Plain-English
            rationales for every architectural choice.
          </p>
        </div>

        <div className="output-feature-card">
          <div className="card-icon">📚</div>
          <h4>Free Learning Resources</h4>
          <p>
            Targeted official documentation and verified interactive tutorials. 100% free with
            zero paywalled courses.
          </p>
        </div>

        <div className="output-feature-card">
          <div className="card-icon">🤖</div>
          <h4>AI Agent Guide</h4>
          <p>
            Practical paired-programming rules — what to verify, boundary enforcement, and how
            to handle edge-case errors cleanly.
          </p>
        </div>

        <div className="output-feature-card">
          <div className="card-icon">💬</div>
          <h4>First Agent Prompt</h4>
          <p>
            The exact starter prompt to kick off Phase 1 in your coding agent. One click to
            copy, paste into your chat, and begin.
          </p>
        </div>
      </div>
    </section>
  );
}
