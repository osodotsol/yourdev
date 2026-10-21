"use client";

import React from "react";

export function ProblemSection() {
  return (
    <section className="craft-section" id="problem">
      <div className="section-eyebrow">01 / THE BEGINNER&apos;S GAP</div>

      <h2 className="section-headline">
        A beginner has an idea.<br />
        <em>Where does it go?</em>
      </h2>

      <div className="craft-problem-split">
        <div className="problem-prose">
          <p>
            New developers open an AI coding agent and face the same wall: a blank prompt field
            and no idea what to type. The idea is in their head — exciting, unstructured, and
            scattered. The agent is powerful but requires concrete direction.
          </p>
          <p>
            The gap between &ldquo;I want to build a thing&rdquo; and &ldquo;Here&apos;s my Phase 1 prompt&rdquo;
            is where most beginners stall and abandon their project.
          </p>
        </div>

        <div className="problem-prose">
          <p>
            <strong>yourdev</strong> bridges that gap. It transforms raw, unformatted brainstorms
            into a clean, structured blueprint that AI coding agents understand instantly —
            phased milestones, a recommended stack, and the exact first prompt to type.
          </p>
          <div className="problem-callout-card">
            <strong>The Golden Rule for Agent Pair Programming:</strong>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
              Never ask an agent to build an entire app at once. Build one small verifiable slice,
              test it, commit it, and only then move to the next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
