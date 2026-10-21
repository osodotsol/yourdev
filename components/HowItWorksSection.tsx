"use client";

import React from "react";

export function HowItWorksSection() {
  return (
    <>
      <section className="how-section container-custom" id="how">
        <div className="how-header">
          <div>
            <div className="section-number-tag">02 / From Idea to Blueprint</div>
            <h2 className="editorial-headline" style={{ fontSize: "2.2rem" }}>
              Three steps. <em>One blueprint.</em>
            </h2>
          </div>
          <a href="#console" className="link-arrow">
            Try it in the console ↗
          </a>
        </div>

        <div className="how-grid">
          <div className="how-step">
            <div className="step-number">01</div>
            <h3 className="step-title">Paste your idea.</h3>
            <p className="step-body">
              Drop your messy, half-formed brainstorm into the text console.
              No formatting needed. Write like you think — run-on sentences,
              bullet fragments, stream of consciousness. Or pick a preset.
            </p>
            <div className="step-meta">Your raw thoughts + one click</div>
          </div>

          <div className="how-step">
            <div className="step-number">02</div>
            <h3 className="step-title">Get a structured blueprint.</h3>
            <p className="step-body">
              The coach analyzes your intent and returns five sections:
              phased roadmap, immediate next actions, recommended tech stack,
              free learning resources, and an AI agent guide with your first prompt.
            </p>
            <div className="step-meta">Dual-mode engine / Gemini + offline fallback</div>
          </div>

          <div className="how-step">
            <div className="step-number">03</div>
            <h3 className="step-title">Copy. Paste. Build.</h3>
            <p className="step-body">
              Hit &ldquo;Copy Blueprint&rdquo; — the entire result is formatted as clean Markdown
              with an explicit agent instruction header. Paste it into your coding agent.
              Start building Phase 1 immediately.
            </p>
            <div className="step-meta">Agent-ready markdown / zero extra prompting</div>
          </div>
        </div>
      </section>
      <div className="container-custom"><hr className="divider" /></div>
    </>
  );
}
