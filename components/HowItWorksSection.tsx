import React from "react";
import { SectionHeading } from "@/components/SectionHeading";

const STEPS = [
  {
    title: "Paste your raw idea",
    body: "Drop your messy brainstorm into the console. No formatting or architecture buzzwords needed. Write like you think: stream of consciousness, bullets, or run-on sentences.",
    input: "A paragraph, in your own words",
    output: "Three or four intake questions",
  },
  {
    title: "Get an execution blueprint",
    body: "The coach analyses your intent and produces a phased roadmap, immediate next actions, a tailored tech stack, the foundations to learn first, and your first agent prompt.",
    input: "Your idea and your answers",
    output: "A blueprint with four milestones",
  },
  {
    title: "Copy. Paste. Build.",
    body: "Copy clean, agent-ready Markdown with explicit instructions into Cursor, Claude, or Copilot and begin Phase 1. Submit your work at each milestone for review.",
    input: "One milestone at a time",
    output: "Verified, working code",
  },
];

export function HowItWorksSection() {
  return (
    <section className="section" id="how" aria-labelledby="how-title">
      <SectionHeading index="02" label="How it works" titleId="how-title">
        From raw concept to <em>working software.</em>
      </SectionHeading>

      <div className="section-body">
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="step-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <dl className="step-io">
                <div>
                  <dt>in</dt>
                  <dd>{step.input}</dd>
                </div>
                <div>
                  <dt>out</dt>
                  <dd>{step.output}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
