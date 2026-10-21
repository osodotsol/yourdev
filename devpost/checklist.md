---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Paste an idea, click "Break it down", and see the 5-part blueprint appear**
  Becomes usable: A running app where you type or paste an idea, hit the button, see a loading shimmer, then 5 result cards (Roadmap, Actions, Stack, Resources, Agent Guide with First Prompt) rendered with the dark themed design. Uses hardcoded fallback data — no API call yet.
  Why now: This is the unique kernel — the entire input → structured output loop — proven end to end on the first slice. Scaffold, components, state, styling, and the core journey all land here. Everything later plugs into this working shell.
  PRD ref: `prd.md > The Core Journey` (steps 1–6), `prd.md > 1. Idea Input & Sample Presets`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Components` (page.tsx, InputConsole, ResultsCards, SkeletonLoader), `spec.md > File Structure`, `spec.md > Look and Feel`, `spec.md > Data Model`
  Build: Scaffold Next.js 14 with TypeScript and Tailwind. Create the TypeScript interfaces in `types/blueprint.ts`. Build `InputConsole.tsx` (textarea, 3 preset chips, "Break it down" button with 15-char validation). Build `SkeletonLoader.tsx` (shimmering dark cards). Build `ResultsCards.tsx` (5 blueprint cards with "Copy Blueprint" and "Copy Prompt" actions). Build `app/page.tsx` tying it together with client state. Style everything per the spec's Look and Feel — dark obsidian palette, Inter + JetBrains Mono, hairline borders, pill buttons, hover lifts. Use a hardcoded fallback response for now.
  Verify (mechanical): Run `npm run dev`, confirm no errors. Type an idea, click "Break it down", confirm shimmer appears then 5 cards render. Click a preset chip, confirm textarea fills. Confirm "Copy Blueprint" and "Copy Prompt" write to clipboard.
  Learner check: Open http://localhost:3000, try typing an idea and hitting "Break it down". Try the preset chips. Does the flow feel right? Does the design match what you pictured?
  Commit: `feat: core breakdown flow with fallback data`

- [ ] **2. The smart fallback engine generates a relevant blueprint from your actual idea**
  Becomes usable: Instead of always showing the same hardcoded response, the app now parses your idea text and generates a tailored 5-part blueprint using the client-side smart template engine — no API key needed.
  Why now: This is the demo reliability guarantee. Once this works, the app is fully functional offline — the API call in slice 3 is an enhancement, not a requirement.
  PRD ref: `prd.md > 2. Breakdown Generation & Smart Fallback`
  Spec ref: `spec.md > Components` (fallbackGenerator.ts), `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Create `lib/fallbackGenerator.ts` — a rule-based engine that reads the user's idea text, extracts keywords and intent, and generates a relevant `IdeaBlueprint` with project-specific phases, actions, stack recommendations, resources, and a tailored first prompt. Wire it into `app/page.tsx` so the "Break it down" button calls the fallback generator. Add the `lib/clipboard.ts` helper to format the agent-ready Markdown with instruction headers.
  Verify (mechanical): Type 3 different ideas (habit tracker, flashcard app, event scraper). Confirm each produces a distinct, relevant blueprint — not the same hardcoded response. Confirm "Copy Blueprint" outputs clean Markdown with the agent instruction header.
  Learner check: Try each preset chip and one idea of your own. Does each blueprint feel tailored to what you typed, or generic?
  Commit: `feat: smart fallback blueprint generator`

- [ ] **3. Live Gemini API integration with automatic fallback**
  Becomes usable: When a Gemini API key is set in `.env.local`, the app calls the real Gemini API and returns a richer, AI-generated blueprint. If the key is missing or the call fails/times out, it silently falls back to the smart engine from slice 2.
  Why now: The fallback already works, so adding the API is a safe enhancement — if anything breaks, the demo still runs.
  PRD ref: `prd.md > 2. Breakdown Generation & Smart Fallback`
  Spec ref: `spec.md > External Services and Dependencies`, `spec.md > Components` (api/breakdown/route.ts, gemini.ts), `spec.md > Important Failure Modes`
  Build: Create `lib/gemini.ts` as the Gemini API client with structured prompt and response parsing. Create `app/api/breakdown/route.ts` — the serverless route that attempts Gemini first (8s timeout), falls back to `fallbackGenerator.ts` on error. Update `app/page.tsx` to call `POST /api/breakdown` instead of the local fallback directly. Create `.env.example` documenting the optional key.
  Verify (mechanical): Without a key — confirm the app still works via fallback. With a key (if available) — confirm a richer response arrives. Simulate a timeout — confirm fallback kicks in.
  Learner check: Try the app with and without a key set. Does the experience feel the same either way? Does the fallback feel seamless?
  Commit: `feat: Gemini API integration with auto-fallback`

- [ ] **4. Visual polish, animations, and responsive refinements**
  Becomes usable: The app has staggered card reveal animations, skeleton shimmer transitions, hover micro-interactions, ambient background glow, and responsive layout for mobile/tablet — matching the premium design spec.
  Why now: All functionality is complete. This pass is pure polish to ensure the demo video looks impressive and the app feels premium.
  PRD ref: `prd.md > Look and Feel`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Look and Feel`
  Build: Add staggered spring-ease card reveal animations on results. Refine the skeleton shimmer timing. Add subtle hover lifts and glow effects on cards and buttons. Add ambient radial gradient background. Ensure responsive breakpoints for mobile. Add a "Start Over" / "Refine Idea" action below results. Verify the clipboard toast animation.
  Verify (mechanical): Run dev server. Click "Break it down" and confirm cards animate in with stagger. Resize viewport to mobile width — confirm layout doesn't break. Confirm hover effects on cards and buttons.
  Learner check: Try the full flow and watch the animations. Resize your browser narrow. Does everything feel polished and premium? Anything feel off?
  Commit: `feat: animations, polish, and responsive layout`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1 (core flow visible, design direction checkable)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: _pending_
Route and stops: _pending_
Edit outcome: _pending_
Reflection: _pending_
Activity mode: _pending_

## Revisions

