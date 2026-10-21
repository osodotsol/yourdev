"use client";

import React from "react";

export function ProblemSection() {
  return (
    <>
      <section className="editorial-section container-custom" id="problem">
        <div>
          <div className="section-number-tag">01 / The Problem</div>
        </div>
        <div className="editorial-split">
          <div>
            <h2 className="editorial-headline">
              A beginner has an idea.<br />
              <em>Where does it go?</em>
            </h2>
          </div>
          <div>
            <p className="editorial-text">
              New developers open a coding agent and face the same wall: a blank prompt field
              and no idea what to type. The idea is in their head — messy, exciting, unstructured.
              The agent is powerful but idle. The gap between &ldquo;I want to build a thing&rdquo; and
              &ldquo;Here&apos;s my Phase 1 prompt&rdquo; is where most beginners stall.
            </p>
            <p className="editorial-text" style={{ marginTop: "1rem" }}>
              Idea Breakdown Coach bridges that gap. It transforms raw, unformatted brainstorms
              into a clean, structured blueprint that AI coding agents understand instantly —
              phased milestones, a recommended stack, and the exact first prompt to type.
            </p>
            <div className="editorial-callout">
              <p>
                Built for beginners using AI coding agents for the first time.
                No login. No database. No cost. Just paste and build.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="container-custom"><hr className="divider" /></div>
    </>
  );
}
