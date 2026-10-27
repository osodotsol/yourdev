import React from "react";
import { Logo } from "@/components/Logo";

const COLUMNS = [
  {
    title: "Navigate",
    links: [
      { href: "#problem", label: "The problem" },
      { href: "#how", label: "How it works" },
      { href: "#console", label: "Blueprint console" },
      { href: "#output", label: "Output blueprint" },
      { href: "/studio-demo", label: "YourDev Studio" },
    ],
  },
  {
    title: "Guided workflow",
    links: [
      { href: "#console", label: "Learning foundations" },
      { href: "#console", label: "Architecture blueprint" },
      { href: "#console", label: "Milestone roadmap" },
      { href: "#console", label: "Step verification" },
      { href: "#console", label: "Launch & export" },
    ],
  },
  {
    title: "Learning resources",
    external: true,
    links: [
      { href: "https://react.dev", label: "React documentation" },
      { href: "https://nextjs.org/docs", label: "Next.js documentation" },
      { href: "https://developer.mozilla.org", label: "MDN Web Docs" },
      { href: "https://docs.github.com/en/copilot", label: "AI pair programming guide" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="craft-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-statement">
            <Logo size={24} showWordmark={true} color="var(--night-text)" wordmarkColor="#ffffff" />
            <h2>Build real software. Understand every step.</h2>
            <p>
              YourDev is a guided software-building and learning environment that helps
              beginner developers bridge the gap between raw ideas and disciplined AI coding
              agent pair programming.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className="footer-col" aria-label={col.title}>
              <h3>{col.title}</h3>
              {col.links.map((link) =>
                col.external ? (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label} <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                )
              )}
            </nav>
          ))}
        </div>

        <div className="footer-bottom">
          <span>YourDev Studio · Build it. Understand it. Verify it.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
