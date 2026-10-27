import React from "react";

const FACTS = [
  { value: "4", label: "phased milestones per idea" },
  { value: "≤3", label: "files to touch in each step" },
  { value: "~90", label: "minutes per milestone, at most" },
  { value: "1", label: "first prompt, ready to paste" },
];

/** The constraints every blueprint is held to, set as a ruled fact line. */
export function PillarsBar() {
  return (
    <dl className="facts">
      {FACTS.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
