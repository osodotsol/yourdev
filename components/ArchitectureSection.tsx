"use client";

import React from "react";

export function ArchitectureSection() {
  return (
    <>
      <section className="arch-section container-custom" id="architecture">
        <div>
          <div className="section-number-tag">05 / Technical Architecture</div>
          <div className="editorial-split" style={{ marginBottom: "3rem" }}>
            <h2 className="editorial-headline">
              Built to never fail <em>on demo day.</em>
            </h2>
            <div>
              <p className="editorial-text">
                Hackathon live demos fail when third-party APIs glitch, rate limit, or go
                down. Idea Breakdown Coach solves this with a resilient dual-mode architecture:
                live Gemini free tier when available, and an instant client-side template
                engine as a zero-latency fallback.
              </p>
            </div>
          </div>
        </div>

        <div className="arch-grid">
          <div className="arch-card">
            <div className="arch-card-number">01</div>
            <h4>Dual-Mode Breakdown Engine</h4>
            <p>
              Calls Google Gemini Free Tier via Next.js App Router API route. If the call
              fails, times out (&gt;8s), or no key is present, the app seamlessly falls back to
              a smart client-side template generator. The demo never breaks on video.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-card-number">02</div>
            <h4>Zero-State Client Resilience</h4>
            <p>
              No user accounts, no SQL databases, no cloud subscriptions. Everything
              functions immediately in the browser. Zero friction to evaluate or try out.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-card-number">03</div>
            <h4>Deterministic Markdown Exporter</h4>
            <p>
              Formatted specifically for AI coding agents (Antigravity, Cursor, Claude).
              Injects clear prompt boundaries, explicit scope constraints, and sequential
              milestones directly into the clipboard.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-card-number">04</div>
            <h4>High-Performance Next.js 14</h4>
            <p>
              Built on React Server Components and Next.js 14 App Router with Tailwind CSS.
              Sub-second initial paint, pristine typography with DM Serif Display, and fluid
              micro-animations.
            </p>
          </div>
        </div>
      </section>
      <div className="container-custom"><hr className="divider" /></div>
    </>
  );
}
