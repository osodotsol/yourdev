"use client";

import React from "react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-heading">
        <div className="footer-brand-title">
          <div className="brand-icon" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
            ✦
          </div>
          <div>
            <span>Idea Breakdown Coach</span>
            <small>DEVPOST // BUILD WITH AI BASICS 2026</small>
          </div>
        </div>

        <a
          href="#top"
          style={{
            font: "11px var(--mono)",
            color: "#e7dfcf",
            textDecoration: "none",
          }}
        >
          Back to top ↑
        </a>
      </div>

      <div className="footer-grid-cols">
        <div className="footer-purpose">
          <h2>Messy ideas in. Agent-ready blueprints out.</h2>
          <p>
            An open educational project helping beginner developers bridge the gap
            between raw concepts and disciplined AI coding agent pair programming.
          </p>
        </div>

        <div className="footer-nav-col">
          <h3>Navigation</h3>
          <a href="#problem">The Problem</a>
          <a href="#how">How It Works</a>
          <a href="#console">Breakdown Console</a>
          <a href="#output">Output Specification</a>
        </div>

        <div className="footer-nav-col">
          <h3>Hackathon</h3>
          <a href="https://devpost.com" target="_blank" rel="noopener noreferrer">
            Devpost Hackathon
          </a>
          <a href="/devpost/spec.html" target="_blank" rel="noopener noreferrer">
            Technical Spec
          </a>
          <a href="/devpost/prd.html" target="_blank" rel="noopener noreferrer">
            PRD Document
          </a>
        </div>

        <div className="footer-nav-col">
          <h3>Technology</h3>
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
            Next.js 14 App Router
          </a>
          <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">
            Google Gemini Free Tier
          </a>
          <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">
            Tailwind CSS
          </a>
        </div>
      </div>

      <div className="footer-bottom-strip">
        <div className="footer-service-status">
          <span className="footer-status-dot"></span>
          <span>Dual-Mode Engine: Operational · Offline Fallback Ready</span>
        </div>
        <div>Zero Paid Dependencies · Local First</div>
      </div>
    </footer>
  );
}
