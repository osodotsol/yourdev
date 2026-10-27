import React from "react";
import { SectionHeading } from "@/components/SectionHeading";

const OUTPUT_ITEMS = [
  {
    title: "Visual execution tree",
    desc: "Four sequential milestones from data contracts to polish. Each one lists the exact files to create, verified docs, and an agent prompt.",
  },
  {
    title: "Per-step mentor review",
    desc: "Submit your code or test logs at each milestone for an immediate critique, approval checks, and guidance on what to fix.",
  },
  {
    title: "Failure modes and traps",
    desc: "Guards against the beginner traps specific to your project: manifest permissions, hydration mismatches, premature auth.",
  },
  {
    title: "Calibrated tech stack",
    desc: "A deliberately small set of frameworks and tools, each with a plain-English reason and the trade-off you are accepting.",
  },
  {
    title: "Single-step and master prompts",
    desc: "Copy a milestone-specific prompt or the full blueprint prompt directly into Cursor, Claude, or Copilot.",
  },
  {
    title: "Progress that stays put",
    desc: "Your session, choices, and reviews are saved in this browser, so a reload never costs you your place.",
  },
];

export function OutputSection() {
  return (
    <section className="section" id="output" aria-labelledby="output-title">
      <SectionHeading
        index="04"
        label="The output specification"
        titleId="output-title"
        lede="Every generated blueprint is structured so you can build milestone by milestone with continuous verification, avoiding hallucination and scope drift."
      >
        Six parts. <em>One roadmap you can actually follow.</em>
      </SectionHeading>

      <div className="section-body">
        <ol className="index-list">
          {OUTPUT_ITEMS.map((item, i) => (
            <li key={item.title}>
              <span className="index-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
