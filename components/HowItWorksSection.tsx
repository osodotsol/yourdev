"use client";

import React from "react";

export function HowItWorksSection() {
  return (
    <section className="landing-section" id="how">
      <div className="landing-eyebrow">
        <span className="eyebrow-dot"></span>
        <span>02 / THREE-STEP JOURNEY</span>
      </div>

      <h2>
        From raw concept to <em>working software.</em>
      </h2>

      <div className="landing-steps">
        <article>
          <div className="landing-step-number">01</div>
          <h3>Paste your raw idea</h3>
          <p>
            Drop your messy brainstorm into the console. No formatting or buzzwords needed.
            Write like you think — stream of consciousness, bullets, or run-on sentences.
          </p>
          <span className="landing-step-label">Input / Any Concept</span>
        </article>

        <article>
          <div className="landing-step-number">02</div>
          <h3>Get an execution blueprint</h3>
          <p>
            The coach analyzes your intent and produces five structured parts:
            phased roadmap, immediate next actions, tailored tech stack, free resources,
            and your first agent prompt.
          </p>
          <span className="landing-step-label">Analysis / Dual-Mode Engine</span>
        </article>

        <article>
          <div className="landing-step-number">03</div>
          <h3>Copy. Paste. Build.</h3>
          <p>
            Click &ldquo;Copy Blueprint&rdquo; to grab clean, agent-ready Markdown with
            explicit instructions. Paste it into Cursor, Claude, or Copilot and begin Phase 1.
          </p>
          <span className="landing-step-label">Execution / Zero Guesswork</span>
        </article>
      </div>
    </section>
  );
}
