"use client";

import React from "react";

export function ProblemSection() {
  return (
    <section className="landing-section" id="problem">
      <div className="landing-eyebrow">
        <span className="eyebrow-dot"></span>
        <span>01 / THE BEGINNER&apos;S GAP</span>
      </div>

      <h2>
        A beginner has an idea.<br />
        <em>Where does it go?</em>
      </h2>

      <div className="landing-problem">
        <div className="landing-prose">
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

        <div className="landing-prose">
          <p>
            Idea Breakdown Coach bridges that gap. It transforms raw, unformatted brainstorms
            into a clean, structured blueprint that AI coding agents understand instantly —
            phased milestones, a recommended stack, and the exact first prompt to type.
          </p>
          <div className="landing-margin-note">
            Built for beginners using AI coding agents for the first time.
            No login. No database. No cost. Just paste and build.
          </div>
        </div>
      </div>
    </section>
  );
}
