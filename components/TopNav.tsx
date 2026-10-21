"use client";

import React from "react";

export function TopNav() {
  return (
    <header className="landing-nav" id="top">
      <a href="#top" className="landing-brand">
        <div className="brand-icon">✦</div>
        <span>Idea Breakdown Coach</span>
      </a>

      <nav className="landing-nav-links" aria-label="Main Navigation">
        <a href="#problem">The Problem</a>
        <a href="#how">How It Works</a>
        <a href="#console">Breakdown Console</a>
        <a href="#output">The Output</a>
        <a href="#architecture">Architecture</a>
      </nav>

      <a href="#console" className="landing-nav-cta">
        Launch Console →
      </a>
    </header>
  );
}
