"use client";

import React from "react";

export function ArchitectureSection() {
  return (
    <section className="landing-section" id="architecture">
      <div className="landing-eyebrow">
        <span className="eyebrow-dot"></span>
        <span>05 / TECHNICAL ARCHITECTURE</span>
      </div>

      <h2>
        Built to never fail <em>on demo day.</em>
      </h2>

      <p className="landing-intro" style={{ marginTop: "12px", maxWidth: "680px" }}>
        Live demos often break due to API limits or network drops. Idea Breakdown Coach
        uses a dual-mode engine: Google Gemini free tier when available, and a smart client-side
        template engine as an automatic fallback.
      </p>

      <div className="output-cards-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="output-paper-card">
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold-accent)", marginBottom: "8px" }}>
            ENGINE // 01
          </div>
          <h4>Dual-Mode Breakdown Engine</h4>
          <p>
            Calls Google Gemini Free Tier via Next.js App Router API route. If the call
            fails or times out (&gt;8s), it seamlessly falls back to the client-side template generator.
            Your demo video never encounters an error.
          </p>
        </div>

        <div className="output-paper-card">
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--gold-accent)", marginBottom: "8px" }}>
            RESILIENCE // 02
          </div>
          <h4>Zero-State Client Resilience</h4>
          <p>
            No database to configure, no login credentials, and no external tracking.
            Users evaluate their concepts in a clean, sandboxed local-first workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
