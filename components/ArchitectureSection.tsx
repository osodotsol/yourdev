"use client";

import React from "react";

export function ArchitectureSection() {
  return (
    <section className="craft-section" id="architecture">
      <div className="section-eyebrow">05 / TECHNICAL ARCHITECTURE</div>

      <h2 className="section-headline">
        Built to never fail <em>on demo day.</em>
      </h2>

      <p className="craft-hero-desc" style={{ marginBottom: "24px" }}>
        Live hackathon demos often break due to API rate limits or network issues.
        Idea Breakdown Coach uses a dual-mode engine: Google Gemini free tier when available,
        and a client-side template generator as an automatic fallback.
      </p>

      <div className="craft-output-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div className="output-feature-card">
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent-green)", fontWeight: 700, marginBottom: "8px" }}>
            ENGINE // 01
          </div>
          <h4>Dual-Mode Breakdown Engine</h4>
          <p>
            Calls Google Gemini Free Tier via Next.js App Router API route. If the call
            fails or times out (&gt;8s), it seamlessly falls back to the client-side template generator.
            Your demo video never breaks on camera.
          </p>
        </div>

        <div className="output-feature-card">
          <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--accent-green)", fontWeight: 700, marginBottom: "8px" }}>
            RESILIENCE // 02
          </div>
          <h4>Zero-State Client Resilience</h4>
          <p>
            No external database, no user accounts, and zero cloud lock-in. Everything
            runs locally and persists cleanly in the browser. Zero friction to evaluate or share.
          </p>
        </div>
      </div>
    </section>
  );
}
