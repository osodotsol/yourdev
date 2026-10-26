"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

const INITIAL_TASKS = [
  { id: 1, text: "Define TypeScript interfaces in types/blueprint.ts", done: true },
  { id: 2, text: "Build mock SingleHabitRow with interactive check toggle", done: true },
  { id: 3, text: "Wire browser localStorage hook for instant offline persistence", done: false },
  { id: 4, text: "Test full creation-to-completion loop on localhost", done: false },
];

export function HeroSection() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <section className="craft-hero" id="hero">
      {/* Left Column */}
      <div className="craft-hero-copy">
        <h1>
          Build real software.<br />
          <em>From idea to verified code.</em>
        </h1>

        <p className="craft-hero-desc">
          YourDev is a guided software-building and learning environment for beginner developers.
          Transform raw ideas into phased architecture, actionable milestones, and verified code
          alongside AI coding agents.
        </p>

        <div className="craft-hero-actions">
          <a href="#console" className="btn-craft-primary">
            <span>Break down an idea</span>
            <span>→</span>
          </a>
          <a href="#output" className="btn-craft-secondary">
            Inspect output blueprint
          </a>
        </div>
      </div>

      {/* Right Column: Interactive Stage Card */}
      <aside className="craft-stage-card" aria-label="Interactive Specimen Card">
        <div className="stage-card-header">
          <span className="stage-pill">VERIFIED MILESTONE</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-soft)" }}>
            PHASE 01 // EXECUTION
          </span>
        </div>

        <h3 className="stage-card-title">Adaptive Habit Tracker</h3>
        <p className="stage-card-sub">
          Interactive Phase 1 Next Actions. Click any step to toggle completion:
        </p>

        <div className="stage-tasks-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="stage-task-row"
              onClick={() => toggleTask(task.id)}
            >
              <div
                className={`stage-task-checkbox ${
                  task.done ? "is-checked" : ""
                }`}
              >
                {task.done && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span
                className={`stage-task-text ${task.done ? "is-done" : ""}`}
              >
                {task.text}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "20px",
            paddingTop: "14px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <span>Progress: {tasks.filter((t) => t.done).length}/{tasks.length} Completed</span>
          <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>Zero Setup Required</span>
        </div>
      </aside>
    </section>
  );
}
