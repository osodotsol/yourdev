---
doc: spec
status: approved
---

# Idea Breakdown Coach — Technical Specification

## How This Works, In Plain Language
Idea Breakdown Coach is a lightweight single-page web app. When you paste an idea or click a sample preset chip and hit **"Break it down"**, the browser sends your text to a backend handler. That handler generates a structured 5-part blueprint (Phased Roadmap, Next Actions, Recommended Stack, Free Resources, and an AI Agent Prompt with a "First Prompt to Use"). 

To ensure the app **never fails during your hackathon demo video**, the engine uses a dual strategy:
1. **Live Free LLM Mode:** Uses Google Gemini's free developer tier (via Google AI Studio) when an API key is present in `.env.local`.
2. **Instant Smart Fallback Mode:** If no key is set, if the internet blips, or if the API times out (>8s), the app automatically runs a client-side smart blueprint generator. This guarantees a smooth, working demo on video with zero setup or paid dependencies.

## The Core Journey Through the System
*Trace from `prd.md > The Core Journey`:*
1. **Load Page:** Browser requests `/` → Next.js serves the single-page layout (`app/page.tsx`) styled with Alien-inspired obsidian dark mode.
2. **Input / Preset:** User types into `InputConsole.tsx` or clicks a preset chip (`AI Habit Tracker with Streaks`, `Spaced Flashcards`, `Local Event Scraper`).
3. **Submit:** User clicks *"Break it down"*. Client validates length (≥ 15 chars).
4. **Loading Transition:** Button switches to disabled pulsing state (`Drafting your blueprint...`), and `ResultsCards.tsx` renders shimmering dark skeleton cards.
5. **Generation Route:** Client calls `POST /api/breakdown` with the user prompt.
   - The route attempts Google Gemini Free Tier.
   - On response (or fallback on error/timeout), returns structured JSON with the 5 sections.
6. **Display Results:** The skeleton dissolves into 5 distinct dark tech cards with glowing icons and monospace metadata.
7. **Copy Actions:**
   - User clicks *"Copy Blueprint"* → `clipboard.ts` formats clean, agent-ready Markdown with instruction headers and writes to clipboard.
   - User clicks *"Copy Prompt"* inside Card 5 → copies the exact starter prompt for their AI coding agent.

## Stack
- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/docs) — Industry standard React framework; handles both the single-page UI and the serverless API route in one unified codebase.
- **Language:** [TypeScript](https://www.typescriptlang.org/docs/) — Enforces strict types on the 5 blueprint sections, preventing silent bugs and improving AI agent pairing.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/docs) — Provides fast, flexible utility styling for the Alien-inspired dark aesthetic (`#050505` obsidian canvas, hairline borders, cyan glows).
- **Icons:** [Lucide React](https://lucide.dev/) (or inline SVGs) — Clean, lightweight modern icons for cards, chips, and copy buttons.
- **Free LLM Provider:** [Google Gemini API (via Google AI Studio)](https://ai.google.dev/) — Free tier (15 requests/min, $0 cost) with auto-fallback to smart offline templates.

## Where It Runs and How Someone Tries It
- **Runtime:** Node.js 18+ on Windows/macOS/Linux.
- **Start Command:**
  ```bash
  npm run dev
  ```
- **Demo URL:** Open `http://localhost:3000` in Google Chrome or Microsoft Edge.
- **Environment Setup (Optional):**
  - Works out of the box with zero configuration (smart fallback engine).
  - To enable live Gemini calls, add to `.env.local`:
    ```env
    GEMINI_API_KEY=your_free_key_from_aistudio
    ```
- **Hackathon Video Recording:** Record the browser at `http://localhost:3000` demonstrating preset selection, generation, results review, and the 1-click copy action in 1–2 minutes.

## Look and Feel
- **Aesthetic:** Inspired by Gloam (`gloam.trade`): sophisticated, minimalist fintech/crypto design with generous panel radiuses, matte surfaces, and understated typography.
- **Palette:**
  - Canvas: Deep matte charcoal/black (`#08090c`) with subtle ambient radial glow.
  - Panels & Surfaces: Layered dark surfaces (`#0e1015` panel, `#14171f` card surfaces) with clean hairline borders (`rgba(255, 255, 255, 0.08)`).
  - Accents: Soft mint/sage green (`#8fd3ad`) for status indicators, active borders, and focus rings.
  - Text: High-contrast crisp white (`#f3f4f6`) for titles, soft silver (`#9ca3af`) for body, muted slate (`#6b7280`) for metadata.
- **Typography:**
  - Headings & UI: `Plus Jakarta Sans` or `Inter` with tight letter tracking (`tracking-[-0.02em]`) and confident sizing.
  - Monospace: `JetBrains Mono` for tags, steps, code blocks, and the "First Prompt to Use" box.
- **Components:** Generously rounded container panel (`rounded-[28px]`), minimalist tile cards (`gl-tile`), pill buttons (`rounded-full`), and subtle hover lifts.

## Components
*All components implement behaviors defined in `prd.md > Features and Behavior`:*

### `app/page.tsx`
- The root single-page container. Maintains state for prompt input, loading, results data, error/fallback notice, and clipboard toast.
- PRD ref: `prd.md > Screens and Layout`.

### `components/InputConsole.tsx`
- Renders the brand header, textarea with live monospace character count, the 3 preset idea chips, and the primary "Break it down" button.
- PRD ref: `prd.md > 1. Idea Input & Sample Presets`.

### `components/ResultsCards.tsx`
- Renders the results header with the "Copy Full Blueprint" button, followed by the 5 vertical tech cards:
  1. **Roadmap Card:** Phased milestone list with status tags.
  2. **Next Actions Card:** Actionable checklist with clear verbs.
  3. **Tech Stack Card:** Recommended stack with plain-English rationales.
  4. **Free Resources Card:** Curated links for documentation and tutorials.
  5. **AI Coding Agent Guide Card:** Prompting guidelines featuring the dedicated **"First Prompt to Use"** box with its own 1-click copy button.
- PRD ref: `prd.md > 2. Breakdown Generation` & `prd.md > 4. Specific AI Coding Agent Guide`.

### `components/SkeletonLoader.tsx`
- Shimmering dark skeleton placeholder cards that animate while generation is underway.
- PRD ref: `prd.md > States and Boundaries (Loading State)`.

### `lib/fallbackGenerator.ts`
- Smart client/server rule-based blueprint generator that parses the user's idea and produces a rich, relevant 5-part blueprint if the external API is offline or slow.
- PRD ref: `prd.md > 2. Breakdown Generation & Smart Fallback`.

### `lib/clipboard.ts`
- Helper that formats the 5 sections into structured Markdown starting with:
  ```markdown
  # Project Blueprint: [Project Title]
  > **AI Coding Agent Instruction:** Use this blueprint to build the project step by step with the user. Follow the phases sequentially and execute the immediate next actions first.
  ```
- PRD ref: `prd.md > 3. Agent-Ready Blueprint Copying`.

## Data Model
TypeScript interfaces for the structured blueprint:

```typescript
export interface BlueprintPhase {
  phase: string;
  title: string;
  description: string;
}

export interface NextAction {
  step: number;
  action: string;
  detail: string;
}

export interface StackItem {
  category: string;
  name: string;
  reason: string;
}

export interface ResourceItem {
  type: string;
  title: string;
  url: string;
}

export interface AgentGuide {
  workflowTips: string[];
  firstPrompt: string;
}

export interface IdeaBlueprint {
  projectTitle: string;
  summary: string;
  roadmap: BlueprintPhase[];
  nextActions: NextAction[];
  techStack: StackItem[];
  resources: ResourceItem[];
  agentGuide: AgentGuide;
  isFallback?: boolean;
}
```

## File Structure
```
your-dev/
├── app/
│   ├── api/
│   │   └── breakdown/
│   │       └── route.ts          # Serverless route calling Gemini with fallback
│   ├── favicon.ico
│   ├── globals.css               # Tailwind directives & Alien dark theme vars
│   ├── layout.tsx                # HTML shell with Inter & JetBrains Mono fonts
│   └── page.tsx                  # Single-page controller & state manager
├── components/
│   ├── InputConsole.tsx          # Textarea, character counter, preset chips, CTA
│   ├── ResultsCards.tsx          # 5 output cards & "First Prompt to Use" box
│   ├── SkeletonLoader.tsx        # Shimmering loading state
│   └── Toast.tsx                 # Floating "Copied to Clipboard" feedback
├── lib/
│   ├── clipboard.ts              # Agent-ready Markdown formatter
│   ├── fallbackGenerator.ts      # Offline smart template engine
│   └── gemini.ts                 # Google Gemini Free Tier API client
├── types/
│   └── blueprint.ts              # TypeScript interfaces
├── devpost/                      # Hackathon planning artifacts
│   ├── learner-profile.md
│   ├── scope.md
│   ├── scope.html
│   ├── prd.md
│   ├── prd.html
│   ├── spec.md
│   └── spec.html
├── .env.example                  # Template showing optional GEMINI_API_KEY
├── .gitignore                    # Excludes .env, learner profile, node_modules
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## External Services and Dependencies
- **Google Gemini API (Free Tier):**
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
  - Cost: Free ($0, up to 15 RPM).
  - Fallback: Auto-switches to `lib/fallbackGenerator.ts` on latency > 8s or error.

## Important Failure Modes
1. **Missing or Invalid API Key:**
   - *Behavior:* System automatically logs notice on server and returns the smart rule-based blueprint without interrupting the user experience.
2. **Slow Network / Timeout (>8 seconds):**
   - *Behavior:* Promise timeout triggers `fallbackGenerator.ts`, serving the blueprint smoothly so the demo video never stalls.
3. **Empty or Short Input (<15 chars):**
   - *Behavior:* Client-side validation disables submit button and displays inline guidance prompt.

## What Was Simplified and Why
- **Dual-Mode Engine (API + Smart Offline Fallback) instead of requiring mandatory API keys:** Eliminates the risk of API quota exhaustion, network drops, or judges being unable to run the code.
- **Single-Page Viewport instead of Multi-Page Dashboard:** Keeps the interaction instant, linear, and ideal for a 1–2 minute video demo.
- **Client-Side State instead of Database Persistence:** Saves 2+ hours of setup time and avoids paid cloud database hosting, satisfying the hackathon free-tier requirement.

## Decisions and Open Issues
- **Clarification on Gemini:** Explained the difference between consumer Gemini web chat and the developer API. Agreed to support both zero-setup offline templates and optional live Gemini API key.
- **Agent-Ready Markdown Structure:** Explicitly agreed to embed coding agent instructions at the top of the copied Markdown.
- **First Prompt to Use:** Added a dedicated quick-copy prompt inside Card 5 for immediate IDE handoff.
- **All technical decisions approved:** Sized strictly for a 2–4 hour hackathon proof of concept.
