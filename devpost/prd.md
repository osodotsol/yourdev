---
doc: prd
status: approved
---

# Idea Breakdown Coach — Product Requirements

A clean, high-precision single-page web app that transforms messy, unstructured project thoughts into an actionable, 5-part agent-ready blueprint for beginner builders.  
*Source: `scope.md > The Unique Kernel` and `scope.md > The Core Loop`.*

> **Positioning:** "Paste a messy idea. Instantly get a clean, copy-paste-ready blueprint designed for beginners using AI coding agents."

## The Core Journey
1. **Arrival:** The user arrives at a sleek dark console with a bold headline, subtext, a prominent 6–8 row textarea, and three clickable sample idea chips.
2. **Input / Preset Selection:** The user pastes their messy brainstorm or clicks a preset chip (e.g., *"AI Habit Tracker with Streaks"*) which auto-fills the field.
3. **Trigger:** The user clicks the primary *"Break it down"* button (enabled once input reaches at least 15 characters).
4. **Processing State:** The button switches to a pulsing state (*"Drafting your blueprint..."*), and a dark shimmering skeleton loader appears in the results area.
5. **Reviewing Results:** The skeleton resolves into five stacked cards:
   - **Phase Roadmap:** 3–5 milestone phases with tags.
   - **Immediate Next Actions:** 4–6 concrete steps with clear action verbs.
   - **Tech Stack Recommendations:** Languages, frameworks, and libraries with plain-English rationales.
   - **Free Learning Resources:** 2–4 targeted, free documentation or tutorial links.
   - **AI Coding Agent Guide:** Practical guidelines featuring an explicit **"First Prompt to Use"** block ready to paste into Antigravity, Cursor, or Claude.
6. **Agent-Ready Copy Action:** The user clicks the prominent *"Copy Blueprint"* button to copy a clean, structured Markdown blueprint designed specifically to guide an AI coding agent.
7. **Refine / Reset:** The user can click *"Refine Idea"* or *"Start Over"* to tweak their input and re-generate.

## Screens and Layout
A single, focused responsive page with two primary vertical sections:
1. **Header & Input Console:**
   - Brand bar: *"Idea Breakdown Coach"* with status indicator.
   - Hero headline: *"Turn messy ideas into working code with AI agents."*
   - Subtext: *"A precision web console for beginner builders. Convert unformatted, chaotic brainstorms into an actionable, agent-ready blueprint in seconds."*
   - Centered large textarea (6–8 rows, styled with dark surface, hairline border, and electric-cyan focus glow).
   - Three quick-fill sample chips: *"🎯 AI Habit Tracker with Streaks"*, *"🃏 Spaced Flashcard Generator"*, *"📍 Local Dev Event Scraper"*.
   - Primary high-contrast pill button: *"Break it down"*.
2. **Results Section (Appears below input):**
   - Header bar with results summary and a prominent pill-shaped *"Copy Blueprint"* button (with visual "Copied!" feedback).
   - Five vertically stacked tech cards with glowing category icons, clean typography, and hairline borders.
   - Bottom navigation actions: *"Refine Idea"* (scrolls back to textarea) and *"Start Over"* (clears input).

## Look and Feel
- **Aesthetic:** Ultra-modern, sleek dark AI console inspired by cutting-edge tech interfaces (Alien aesthetic): deep obsidian backgrounds, crisp minimalism, and glowing electric accents.
- **Color Palette:**
  - Background: Deep obsidian black (`#050505` to `#09090b`) with subtle ambient radial glow (`rgba(56, 189, 248, 0.06)`).
  - Surfaces: Sleek dark cards (`#0c0d12`, `#121217`) with crisp hairline borders (`rgba(255, 255, 255, 0.08)`).
  - Text: High-contrast pure white headlines (`#ffffff`), crisp light silver body text (`#f1f5f9`), and muted technical slate for secondary notes (`#94a3b8`).
  - Accents: Electric neon blue and cyan glow (`#38bdf8`, `#0ea5e9`, `#60a5fa`) for active states, key tags, and primary CTAs.
- **Typography:**
  - Headlines & Body: Ultra-clean modern geometric sans (Inter / Plus Jakarta Sans) with bold title tracking and high contrast.
  - Code & Metadata: High-tech monospace (JetBrains Mono / SF Mono) for prompts, phases, and technical tags.
- **Components:** Precision hairline borders (`border border-white/10`), soft atmospheric glow shadows (`box-shadow: 0 0 25px rgba(56, 189, 248, 0.15)`), pill action buttons, and subtle hover lifts.

## Features and Behavior

### 1. Idea Input & Sample Presets
- As a beginner builder, I want to quickly paste my rough idea or click a pre-filled sample so I don't feel intimidated by a blank box.
  - [ ] Textarea supports multiline pasting with comfortable 6–8 row height.
  - [ ] Clicking any of the 3 sample chips instantly populates the textarea.
  - [ ] Monospace character indicator displays live character count; alerts if under 15 characters.

### 2. Breakdown Generation & Smart Fallback
- As a beginner builder, I want the coach to analyze my messy text and organize it into five actionable categories reliably.
  - [ ] Submitting triggers generation without page reload.
  - [ ] Generates 3–5 milestone phases in sequential order.
  - [ ] Generates 4–6 concrete immediate action items.
  - [ ] Suggests appropriate beginner-friendly tools with plain-English justification.
  - [ ] Lists 2–4 verified free learning resources.
  - [ ] **Demo Reliability Fallback:** If the free LLM call is slow (>10s) or fails, the system automatically uses a smart client-side blueprint generator matching the input idea so the user demo never breaks.

### 3. Agent-Ready Blueprint Copying
- As a user, I want the copied Markdown to be formatted specifically so my AI coding agent understands how to use it immediately.
  - [ ] "Copy Blueprint" button formats Markdown with clear instruction header:
    ```markdown
    # Project Blueprint: [Project Name]
    > **AI Coding Agent Instruction:** Use this blueprint to collaborate with the user. Follow the phases sequentially and execute the immediate next actions first.
    ```
  - [ ] Button toggles to "Copied!" for 2 seconds upon success.

### 4. Specific AI Coding Agent Guide & "First Prompt to Use"
- As a user, I want an exact prompt I can copy and paste into my coding agent right away.
  - [ ] Card 5 includes a distinct **"First Prompt to Use"** sub-section.
  - [ ] Displays a dedicated quick-copy snippet for the first prompt.

## States and Boundaries
- **Initial / Empty State:** Textarea is empty; "Break it down" button is visually disabled (or prompts with inline guidance if clicked).
- **Validation State (< 15 chars):** Friendly inline alert: *"Tell me a bit more! Give me at least a full sentence so I can build a good roadmap."*
- **Loading State:** "Break it down" button is disabled and pulses with *"Drafting your blueprint..."*. Results area displays dark shimmering skeleton cards.
- **Success State:** Skeleton dissolves smoothly into the 5 populated cards; "Copy Blueprint" button becomes active.
- **Graceful Fallback State:** If network drops or rate limit hits, smoothly presents the smart template-generated blueprint with a subtle indicator: *"Generated using reliable offline blueprint template"*, ensuring the demo never halts.

## Product Decisions
- **Agent-Ready Markdown Structure:** Explicitly tuned output format with an AI instruction header at the top of the clipboard export, directly distinguishing this tool from generic chatbot summaries.
- **First Prompt to Use:** Added an explicit starter prompt inside Card 5 so beginners know the exact first sentence to give their coding agent.
- **Client-Side Smart Fallback:** Prevents hackathon demo video failures if the free tier API encounters latency or downtime.
- **Stacked Vertical Cards over Grid:** Adopted sequential vertical cards because linear roadmaps and reading flows are vastly more legible on both mobile and desktop.

## What We're Building (PoC Target)
- Responsive single-page web app matching the Alien dark console aesthetic.
- Interactive input box with 3 rich instant sample chips.
- End-to-end breakdown generation into 5 modular cards.
- Polished skeleton loader and client-side smart fallback.
- One-click agent-ready clipboard copy utility.

## Deferred From the POC
- Multi-turn interrogative coaching chat.
- Content creator / writer project modes.
- User accounts and saving past blueprints across sessions.
- Visual diagram generation (Mermaid canvas).

## Non-Goals
- No user authentication or login screens.
- No database storage.
- No paid API subscriptions (must remain 100% free to test and demo).

## Open Questions
- *None:* PRD is approved and ready for technical blueprinting in `4-spec`.
