import React from "react";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

const ABILITIES = [
  {
    title: "Knows your project.",
    body: "Answers with your stack, your active milestone, and the files it asks you to create.",
  },
  {
    title: "Reviews before you move on.",
    body: "Checks submitted code and logs against the step’s definition of done.",
  },
  {
    title: "Keeps working offline.",
    body: "Falls back to built-in guidance when the AI service is unavailable.",
  },
  {
    title: "Never runs anything.",
    body: "Replies are inert Markdown. You stay in control of your code.",
  },
];

interface MentorSectionProps {
  onOpenMentor: () => void;
}

export function MentorSection({ onOpenMentor }: MentorSectionProps) {
  return (
    <section className="section" id="mentor" aria-labelledby="mentor-title">
      <SectionHeading index="05" label="Your mentor" titleId="mentor-title">
        Stuck between steps? <em>Ask Devi.</em>
      </SectionHeading>

      <div className="section-body">
        <div className="mentor">
          <div className="mentor-figure">
            <img
              src="/images/devi-portrait.jpg"
              alt="Devi, the YourDev mentor, holding a tablet showing code"
              width={440}
              height={507}
              loading="lazy"
            />
          </div>
          <div className="mentor-copy">
            <h3>A patient pair programmer who has read your blueprint.</h3>
            <p>
              Devi sits beside every milestone. Ask why a step comes first, paste an error you
              don’t understand, or have your work checked before you continue.
            </p>
            <ul className="mentor-list">
              {ABILITIES.map((a) => (
                <li key={a.title}>
                  <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                  <span>
                    <strong>{a.title}</strong> {a.body}
                  </span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn-primary btn-lg" onClick={onOpenMentor}>
              Ask Devi a question
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
