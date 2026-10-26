# YourDev

> **Build it. Understand it. Verify it.**

YourDev is an autonomous software architecture and pair-programming verification studio designed for beginner developers building applications with AI coding agents.

## Key Workspaces

1. **Architecture & Breakdown Console (`/`)**:
   - Transforms messy brainstorms and raw notes into structured, agent-ready execution blueprints.
   - Generates tailored tech stacks, architecture boundaries, phased milestones, and an exact "First Prompt to Use" for AI agents.
   - Dual-mode resilience: connects to Google Gemini when configured, or seamlessly activates instant domain heuristics when offline or without an API key.

2. **YourDev Studio (`/studio-demo`)**:
   - A coordinated three-panel Build Studio prototype featuring a live specimen application (Habit Tracker), an incremental improvement controller, and deterministic DOM inspection verification.
   - Demonstrates slice-by-slice software engineering with tangible feedback loops.

3. **Ask YourDev Mentor Chat (`/api/chat`)**:
   - Context-aware coding mentor side drawer providing guided explanations, verification failure diagnosis, and next-step recommendations.
   - Dual-mode operation: connects to Google Gemini when configured, or provides deterministic offline mentor guidance.
   - Safe Markdown rendering with inert code blocks and sanitized links.

## Technical Stack & Security Hardening

- **Framework**: Next.js 15.5.28 (App Router)
- **Runtime & UI**: React 18.3.1, TypeScript 5.9, Tailwind CSS 3.4
- **Hardening**:
  - Image Optimization API disabled via `images.unoptimized: true` to eliminate image-processing vulnerability surfaces.
  - Global HTTP security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`, `Permissions-Policy`).
  - Strict input boundary limits and payload truncation guards on public endpoints.
  - Server-side log sanitization with automated credential redaction.
  - Fail-closed production protection disabling test simulation hooks outside development.
  - In-memory sliding-window rate limiting on `/api/chat` for single-instance protection. *(Note: Distributed rate limiting via a shared key-value store such as Upstash Redis or Cloudflare WAF is not yet implemented and remains a documented setup requirement for multi-instance public production clusters).*

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production build
npm run build

# Start production server
npm start
```

## Verification Suites

```bash
# Dependency security audit (0 vulnerabilities)
npm audit

# TypeScript type checks
node node_modules/typescript/bin/tsc --noEmit

# Studio prototype verification suite
node test-studio-demo.js

# Application regression suite
node test-task1.js

# Security remediation suite
node test-security.js

# Ask YourDev mentor chat regression suite
node test-chat.js

# Production server smoke test
node smoke-test-prod.js
```
