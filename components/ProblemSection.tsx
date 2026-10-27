import React from "react";
import { SectionHeading } from "@/components/SectionHeading";

const ROWS = [
  {
    aspect: "What you ask for",
    trap: "“Build me a full app.”",
    method: "One slice: a typed habit model and a single row on screen. Nothing else yet.",
  },
  {
    aspect: "What the agent returns",
    trap: "800 lines of unverified code across 14 new files, with missing dependencies.",
    method: "Two or three files you can read in one sitting, scoped to about 90 minutes.",
  },
  {
    aspect: "How you check it",
    trap: "You hope it runs, then get stuck on line 12.",
    method: "A written definition of done, tested on localhost and reviewed by your mentor.",
  },
  {
    aspect: "Outcome",
    trap: "Overwhelm, broken builds, abandoned ideas.",
    method: "Working software, step-by-step confidence.",
    isOutcome: true,
  },
];

export function ProblemSection() {
  return (
    <section className="section" id="problem" aria-labelledby="problem-title">
      <SectionHeading
        index="01"
        label="The beginner’s gap"
        titleId="problem-title"
        lede="Opening Cursor or Claude with a messy brainstorm usually ends the same way. The difference isn’t the agent. It’s the size of what you ask it to do."
      >
        A beginner has an idea. <em>Where does it go?</em>
      </SectionHeading>

      <div className="section-body">
        <table className="compare">
          <caption className="sr-only">
            The blank prompt approach compared with the YourDev method
          </caption>
          <thead>
            <tr>
              <td />
              <th scope="col">
                <span className="status status-fail">The blank prompt trap</span>
              </th>
              <th scope="col">
                <span className="status status-done">The YourDev method</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.aspect} className={row.isOutcome ? "is-outcome" : undefined}>
                <th scope="row">{row.aspect}</th>
                <td className="is-trap" data-col="Blank prompt">
                  {row.trap}
                </td>
                <td className="is-method" data-col="YourDev">
                  {row.method}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <blockquote className="rule-quote">
          <p>
            Never ask an agent to build an entire app at once. Build one small verifiable
            slice, test it on localhost, commit it, and only then move to the next.
          </p>
          <footer className="label">The golden rule for agent pair programming</footer>
        </blockquote>
      </div>
    </section>
  );
}
