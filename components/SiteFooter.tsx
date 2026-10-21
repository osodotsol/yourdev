"use client";

import React from "react";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="craft-footer">
      <div className="footer-top">
        <div className="footer-brand-title">
          <Logo size={28} showWordmark={true} color="#f4eddf" />
          <span style={{ fontSize: "11px", color: "#8a867c", marginLeft: "14px", fontFamily: "var(--mono)" }}>
            DEVPOST // BUILD WITH AI BASICS 2026
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
            The to-do list that builds your vision.
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: "1.7" }}>
            yourdev helps beginner developers bridge the gap between
            raw ideas and disciplined AI coding agent pair programming.
          </p>
        </div>

        <div>
          <h3>Navigation</h3>
          <a href="#problem">The Problem</a>
          <a href="#how">How It Works</a>
          <a href="#console">Breakdown Console</a>
          <a href="#output">Output Specification</a>
        </div>

        <div>
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

        <div>
          <h3>Technology</h3>
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
            Next.js 14 App Router
          </a>
          <a href="#console">
            Autonomous Architect Engine
          </a>
          <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">
            Tailwind CSS
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>yourdev · Autonomous Architecture & Spec Studio</div>
        <div>Zero Paid Dependencies · Local First</div>
      </div>
    </footer>
  );
}
