"use client";

import React from "react";

export function TopNav() {
  return (
    <header className="craft-floating-nav" id="top">
      <a href="#top" className="craft-nav-brand">
        <div className="craft-brand-badge">✦</div>
        <span>Idea Breakdown Coach</span>
      </a>

      <nav className="craft-nav-links" aria-label="Main Navigation">
        <a href="#problem">The Problem</a>
        <a href="#how">How It Works</a>
        <a href="#console">Breakdown Console</a>
        <a href="#output">Output</a>
        <a href="#architecture">Architecture</a>
      </nav>

      <a href="#console" className="craft-nav-cta">
        <span>Launch Console</span>
        <span>→</span>
      </a>
    </header>
  );
}
