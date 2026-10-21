"use client";

import React from "react";

export function TopNav() {
  return (
    <nav className="top-nav">
      <a href="#hero" className="nav-brand">
        <div className="nav-brand-icon">✦</div>
        <span>Idea Breakdown Coach</span>
      </a>
      <div className="nav-links">
        <a href="#how">How it works</a>
        <a href="#console">Live Console</a>
        <a href="#output">Output</a>
        <a href="#architecture">Architecture</a>
        <div className="nav-badge">
          <div className="dot"></div>
          <span>DEVPOST · BUILD WITH AI</span>
        </div>
      </div>
    </nav>
  );
}
