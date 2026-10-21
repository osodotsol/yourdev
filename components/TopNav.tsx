"use client";

import React from "react";
import { Logo } from "@/components/Logo";

export function TopNav() {
  return (
    <header className="craft-floating-nav" id="top">
      <a href="#top" className="craft-nav-brand">
        <Logo size={26} showWordmark={true} color="#18191a" />
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
