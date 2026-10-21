"use client";

import React from "react";

export function OutputSection() {
  return (
    <>
      <div className="section-spacer"></div>
      <section className="output-section container-custom" id="output">
        <div>
          <div className="section-number-tag">04 / What You Get</div>
          <div className="editorial-split" style={{ marginBottom: "3.5rem" }}>
            <h2 className="editorial-headline">
              Five sections.<br />
              <em>One agent-ready document.</em>
            </h2>
            <div>
              <p className="editorial-text">
                Every generated blueprint includes exactly the structure an AI coding agent
                needs to start executing — no extra prompting, no interpretation gaps, no
                wasted conversation.
              </p>
            </div>
          </div>
        </div>

        <div className="output-cards">
          <div className="output-card">
            <div className="output-card-icon">🗺️</div>
            <h4>Phase Roadmap</h4>
            <p>
              3–5 sequential milestones from skeleton to polish. Each phase is scoped to a
              single working commit an agent can build independently.
            </p>
          </div>
          <div className="output-card">
            <div className="output-card-icon">⚡</div>
            <h4>Immediate Actions</h4>
            <p>
              4–6 concrete steps with action verbs. The first thing you do after reading
              the blueprint — no ambiguity about where to begin.
            </p>
          </div>
          <div className="output-card">
            <div className="output-card-icon">🧱</div>
            <h4>Tech Stack</h4>
            <p>
              Beginner-friendly tools with plain-English rationales. Every choice
              explained so you understand why, not just what.
            </p>
          </div>
          <div className="output-card">
            <div className="output-card-icon">📚</div>
            <h4>Free Resources</h4>
            <p>
              2–4 targeted, verified links to documentation and tutorials. All free, all
              immediately useful. No paid courses.
            </p>
          </div>
          <div className="output-card">
            <div className="output-card-icon">🤖</div>
            <h4>Agent Guide</h4>
            <p>
              Practical tips for collaborating with AI coding agents — what to ask, what to
              verify, how to iterate effectively.
            </p>
          </div>
          <div className="output-card">
            <div className="output-card-icon">💬</div>
            <h4>First Prompt</h4>
            <p>
              An exact, copy-pasteable prompt to kick off Phase 1 in your agent. One click →
              paste → start building.
            </p>
          </div>
        </div>
      </section>
      <div className="container-custom"><hr className="divider" /></div>
    </>
  );
}
