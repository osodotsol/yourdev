"use client";

import React from "react";

export function HowItWorksSection() {
  return (
    <section className="craft-section" id="how">
      <div className="section-eyebrow">02 / THREE-STEP ENGINE</div>

      <h2 className="section-headline">
        From raw concept to <em>working software.</em>
      </h2>

      <div className="craft-steps-grid">
        <div className="craft-step-card">
          <div className="craft-step-num">01</div>
          <h3>Paste your raw idea</h3>
          <p>
            Drop your messy brainstorm into the console. No formatting or architecture buzzwords needed.
            Write like you think — stream of consciousness, bullets, or run-on sentences.
          </p>
        </div>

        <div className="craft-step-card">
          <div className="craft-step-num">02</div>
          <h3>Get an execution blueprint</h3>
          <p>
            The coach analyzes your intent and produces five structured parts:
            phased roadmap, immediate next actions, tailored tech stack, free resources,
            and your first agent prompt.
          </p>
        </div>

        <div className="craft-step-card">
          <div className="craft-step-num">03</div>
          <h3>Copy. Paste. Build.</h3>
          <p>
            Click &ldquo;Copy Blueprint&rdquo; to grab clean, agent-ready Markdown with
            explicit instructions. Paste it into Cursor, Claude, or Copilot and begin Phase 1.
          </p>
        </div>
      </div>
    </section>
  );
}
