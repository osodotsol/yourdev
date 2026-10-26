"use client";

import React from "react";
import { Logo } from "@/components/Logo";
import { Sparkles } from "lucide-react";

interface TopNavProps {
  onOpenMentor?: () => void;
}

export function TopNav({ onOpenMentor }: TopNavProps = {}) {
  return (
    <header className="craft-floating-nav" id="top">
      <a href="#top" className="craft-nav-brand">
        <Logo size={24} showWordmark={true} color="#18191a" />
      </a>

      <nav className="craft-nav-links" aria-label="Main Navigation">
        <a href="#problem">Problem</a>
        <a href="#how">How It Works</a>
        <a href="#console">Console</a>
        <a href="#output">Blueprint</a>
        <a href="/studio-demo">Studio</a>
      </nav>

      <div className="craft-nav-actions">
        {onOpenMentor && (
          <button
            type="button"
            id="topnav-ask-mentor"
            onClick={onOpenMentor}
            className="craft-nav-secondary-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask Mentor</span>
          </button>
        )}
        <a href="#console" className="craft-nav-cta">
          <span>Launch Console</span>
        </a>
      </div>
    </header>
  );
}
