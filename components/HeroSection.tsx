"use client";

import React from "react";

const CHART_HEIGHTS = [
  65, 80, 45, 90, 70, 55, 85, 40, 95, 60, 75, 50, 0, 88, 72, 0, 55, 80, 0, 65,
  78, 90, 42, 70,
];

export function HeroSection() {
  return (
    <section className="hero container-custom" id="hero">
      <div className="hero-grid">
        {/* Left Column */}
        <div className="hero-left">
          <div className="hero-tag">
            <span className="tag-dot"></span>
            <span>Beginner Builders / AI Agent Workflows</span>
          </div>
          <h1 className="hero-headline">
            Messy ideas in.<br />
            <em>Agent-ready blueprints out.</em>
          </h1>
          <p className="hero-body">
            A precision web console for new developers overwhelmed by blank IDEs.
            Paste chaotic thoughts, receive a structured blueprint your AI coding agent
            can execute immediately — phased roadmap, next actions, stack, resources,
            and your exact first prompt.
          </p>
          <div className="hero-actions">
            <a href="#console" className="btn-hero">
              Try the live console <span>↗</span>
            </a>
            <a href="#output" className="link-arrow">
              Inspect sample output <span>↓</span>
            </a>
          </div>
        </div>

        {/* Right Column: Hero Card Preview */}
        <div className="hero-card-preview">
          <div className="preview-header">
            <span className="preview-label">LIVE SPECIFICATION</span>
            <span className="preview-badge">v0.1.0-poc</span>
          </div>
          <h3 className="preview-title">Idea Breakdown Coach</h3>

          {/* Mini Bar Chart */}
          <div className="mini-chart" id="heroChart">
            {CHART_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`mini-bar ${h > 0 ? "filled" : "empty"}`}
                style={{
                  height: `${h > 0 ? h : 30}%`,
                  opacity: h > 0 ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          {/* Key Metrics */}
          <div className="preview-stats">
            <div className="stat-item">
              <div className="stat-number">03 / 05</div>
              <div className="stat-label">Phased Roadmap</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">04 / 06</div>
              <div className="stat-label">Next Steps</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">ZERO</div>
              <div className="stat-label">Setup Cost</div>
            </div>
          </div>

          <div className="preview-footer">
            <p className="preview-footer-text">
              &ldquo;Turn raw concept into an instant agent roadmap before you touch code.&rdquo;
            </p>
            <p className="preview-footer-note">
              Dual-mode engine · Google Gemini API + instant offline template engine
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
