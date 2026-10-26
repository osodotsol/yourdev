"use client";

import React from "react";

export function BeginnersSection() {
  return (
    <>
      <section className="beginners-section container-custom" id="beginners">
        <div className="beginners-grid">
          <div>
            <div className="section-number-tag">06 / Designed For Beginners</div>
            <h2 className="editorial-headline">
              Why most learners stall with AI.<br />
              <em>And how we fix it.</em>
            </h2>
            <p className="editorial-text" style={{ marginTop: "1.5rem" }}>
              Most beginners give AI coding agents vague instructions like &ldquo;build me an app
              for habit tracking.&rdquo; The agent generates hundreds of disconnected lines of code,
              the build breaks, and the beginner gives up.
            </p>
            <p className="editorial-text" style={{ marginTop: "1rem" }}>
              YourDev enforces the foundational rule of software development:
              slice complex goals into small, verifiable working increments.
            </p>
          </div>

          <div>
            <div className="principle-item">
              <div className="principle-number">Principle 01</div>
              <h3 className="principle-title">Zero Jargon Prompts</h3>
              <p className="principle-body">
                You don&apos;t need to know architectural buzzwords. Paste your messy notes in plain
                English. The coach maps your intent into standard technical patterns.
              </p>
            </div>

            <div className="principle-item">
              <div className="principle-number">Principle 02</div>
              <h3 className="principle-title">Slice-by-Slice Execution</h3>
              <p className="principle-body">
                Never build everything at once. Every phase in the generated roadmap delivers a
                usable, testable increment before advancing.
              </p>
            </div>

            <div className="principle-item">
              <div className="principle-number">Principle 03</div>
              <h3 className="principle-title">Verify Before Moving On</h3>
              <p className="principle-body">
                The generated guide reminds you to test each step before writing new prompts.
                Catch mistakes when they are small and simple.
              </p>
            </div>

            <div className="principle-item">
              <div className="principle-number">Principle 04</div>
              <h3 className="principle-title">You Own the Decisions</h3>
              <p className="principle-body">
                The agent assists, but you drive the product vision. The blueprint provides
                clarity without taking over your creative direction.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="container-custom"><hr className="divider" /></div>
    </>
  );
}
