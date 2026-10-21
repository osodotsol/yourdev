"use client";

import React from "react";

export function FileMapSection() {
  return (
    <>
      <section className="filetree-section container-custom" id="files">
        <div>
          <div className="section-number-tag">07 / Project File Map</div>
          <div className="editorial-split" style={{ marginBottom: "2.5rem" }}>
            <h2 className="editorial-headline">
              Clean, modular<br />
              <em>Next.js structure.</em>
            </h2>
            <p className="editorial-text">
              Zero boilerplate debt. Every file serves a single clear purpose,
              strictly calibrated to the Devpost Build With AI Basics specification.
            </p>
          </div>
        </div>

        <div className="filetree-card">
          <pre>
            <span className="folder">your-dev/</span>
            {"\n"}├── <span className="folder">app/</span>
            {"\n"}│   ├── <span className="folder">api/</span>
            {"\n"}│   │   └── <span className="folder">breakdown/</span>
            {"\n"}│   │       └── <span className="file-highlight">route.ts</span>            <span style={{ color: "var(--text-mute)" }}># Dual-mode Gemini API + fallback route</span>
            {"\n"}│   ├── <span className="file-highlight">globals.css</span>         <span style={{ color: "var(--text-mute)" }}># DM Serif + Inter theme variables</span>
            {"\n"}│   ├── <span className="file-highlight">layout.tsx</span>          <span style={{ color: "var(--text-mute)" }}># Google Font configuration</span>
            {"\n"}│   └── <span className="file-highlight">page.tsx</span>            <span style={{ color: "var(--text-mute)" }}># Interactive breakdown console shell</span>
            {"\n"}├── <span className="folder">components/</span>
            {"\n"}│   ├── <span className="file-highlight">HeroSection.tsx</span>     <span style={{ color: "var(--text-mute)" }}># Hero split with mini bar chart</span>
            {"\n"}│   ├── <span className="file-highlight">ConsoleSection.tsx</span>  <span style={{ color: "var(--text-mute)" }}># Textarea, presets, 5-part results</span>
            {"\n"}│   ├── <span className="file-highlight">OutputSection.tsx</span>   <span style={{ color: "var(--text-mute)" }}># 6-card output specification (#output)</span>
            {"\n"}│   └── <span className="file-highlight">SideNav.tsx</span>         <span style={{ color: "var(--text-mute)" }}># Scroll spy quick section navigator</span>
            {"\n"}├── <span className="folder">lib/</span>
            {"\n"}│   ├── <span className="file-highlight">clipboard.ts</span>        <span style={{ color: "var(--text-mute)" }}># Agent-ready Markdown formatter</span>
            {"\n"}│   ├── <span className="file-highlight">fallbackGenerator.ts</span><span style={{ color: "var(--text-mute)" }}># Instant offline template engine</span>
            {"\n"}│   └── <span className="file-highlight">gemini.ts</span>           <span style={{ color: "var(--text-mute)" }}># Google Gemini Free Tier client</span>
            {"\n"}├── <span className="folder">types/</span>
            {"\n"}│   └── <span className="file-highlight">blueprint.ts</span>        <span style={{ color: "var(--text-mute)" }}># TypeScript interfaces for blueprint</span>
            {"\n"}└── <span className="folder">devpost/</span>
            {"\n"}    ├── <span className="file-highlight">scope.html</span>          <span style={{ color: "var(--text-mute)" }}># Proof of concept boundary document</span>
            {"\n"}    ├── <span className="file-highlight">prd.html</span>            <span style={{ color: "var(--text-mute)" }}># Product requirements definition</span>
            {"\n"}    └── <span className="file-highlight">spec.html</span>           <span style={{ color: "var(--text-mute)" }}># Technical architecture specification</span>
          </pre>
        </div>
      </section>
    </>
  );
}
