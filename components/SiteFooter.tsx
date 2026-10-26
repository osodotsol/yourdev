"use client";

import React from "react";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="craft-footer">
      <div className="footer-top">
        <div className="footer-brand-title">
          <Logo size={28} showWordmark={true} color="#f4eddf" wordmarkColor="#ffffff" />
          <span style={{ fontSize: "11px", color: "#8a867c", marginLeft: "14px", fontFamily: "var(--mono)" }}>
            YOURDEV // BUILD STUDIO 2026
          </span>
        </div>

        <a
          href="#top"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "12px",
            color: "#e5e7eb",
            textDecoration: "none",
          }}
        >
          Back to top ↑
        </a>
      </div>

      <div className="footer-cols">
        <div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "24px", fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>
            Build real software. Understand every step.
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: "1.7" }}>
            YourDev is a guided software-building and learning environment designed to
            help beginner developers bridge the gap between raw ideas and disciplined AI
            coding agent pair programming.
          </p>
        </div>

        <div>
          <h3>Navigation</h3>
          <a href="#problem">The Problem</a>
          <a href="#how">How It Works</a>
          <a href="#console">Blueprint Console</a>
          <a href="#output">Output Blueprint</a>
          <a href="/studio-demo">YourDev Studio</a>
        </div>

        <div>
          <h3>Guided Workflow</h3>
          <a href="#console">Learning Foundations</a>
          <a href="#console">Architecture Blueprint</a>
          <a href="#console">Milestone Roadmap</a>
          <a href="#console">Step Verification</a>
          <a href="#console">Launch & Export</a>
        </div>

        <div>
          <h3>Learning Resources</h3>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            React Documentation
          </a>
          <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
            Next.js Documentation
          </a>
          <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">
            MDN Web Docs
          </a>
          <a href="https://docs.github.com/en/copilot" target="_blank" rel="noopener noreferrer">
            AI Pair Programming Guide
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>YourDev Studio · Build it. Understand it. Verify it.</div>
        <div>Guided Learning & Architecture · Local First</div>
      </div>
    </footer>
  );
}
