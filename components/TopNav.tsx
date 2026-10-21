"use client";

import React from "react";

export function TopNav() {
  return (
    <header className="craft-floating-nav" id="top">
      <a href="#top" className="craft-nav-brand">
        <div className="craft-brand-badge">yd</div>
        <span style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>yourdev</span>
      </a>

      <nav className="craft-nav-links" aria-label="Main Navigation">
        <a href="#problem">The Problem</a>
        <a href="#how">How It Works</a>
        <a href="#console">Breakdown Console</a>
        <a href="#output">Output</a>
      </nav>

      <a href="#console" className="craft-nav-cta">
        <span>Launch Console</span>
        <span>→</span>
      </a>
    </header>
  );
}
