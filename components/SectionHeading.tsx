import React from "react";

interface SectionHeadingProps {
  index: string;
  label: string;
  titleId: string;
  children: React.ReactNode;
  lede?: React.ReactNode;
}

/** Ruled section header: index in the margin column, serif title in the main column. */
export function SectionHeading({ index, label, titleId, children, lede }: SectionHeadingProps) {
  return (
    <header className="section-head">
      <p className="section-index">
        <b>{index}</b>
        <span>{label}</span>
      </p>
      <div>
        <h2 id={titleId} className="section-title">
          {children}
        </h2>
        {lede && <p className="section-lede">{lede}</p>}
      </div>
    </header>
  );
}
