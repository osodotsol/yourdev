"use client";

import React from "react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-custom footer-inner">
        <div className="footer-left">
          <div className="footer-logo">✦</div>
          <span className="footer-text">
            Idea Breakdown Coach · Devpost Build With AI Basics 2026
          </span>
        </div>
        <div className="footer-right">
          <a href="#hero">Back to top</a>
          <a
            href="https://devpost.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Devpost
          </a>
          <a
            href="https://ai.google.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Gemini
          </a>
        </div>
      </div>
    </footer>
  );
}
