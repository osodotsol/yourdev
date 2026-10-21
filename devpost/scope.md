---
doc: scope
status: approved
---

# Idea Breakdown Coach

A focused web app that turns messy, overwhelming project ideas into an actionable, agent-ready build blueprint in one click.

> **Positioning:** "Paste a messy idea. Instantly get a clean, copy-paste-ready blueprint designed for beginners using AI coding agents."

## The Unique Kernel
Unlike generic chatbots that return conversational text walls, Idea Breakdown Coach is purpose-built to bridge human brainstorming and AI coding agents: it instantly converts raw thoughts into an execution-ready blueprint containing phased milestones, concrete next steps, stack rationales, and an explicit **"First Prompt to Use"** designed to be pasted directly into Antigravity, Cursor, or Claude. For demo reliability, it includes smart client-side template fallbacks so the workflow never fails.

## Who It's For
Aspiring creators and developers who have creative ideas but get stuck in the exhausting loop of copying, pasting, and guessing how to start. They need clarity without feeling overwhelmed by technical jargon.

## The Core Loop
1. The user opens the clean interface.
2. Pastes a raw, unorganized project idea into the input area.
3. Clicks "Break it down".
4. Instantly receives a structured 5-part blueprint (Phased Roadmap, Concrete Actions, Tech Stack, Free Resources, AI Agent Guide) that they can immediately use to start building.

## Inspiration & Identity
- Mood: Calming, fast, and empowering. Replaces overwhelm with instant clarity.
- Design: Modern, clean typography, card-based results, and frictionless interaction.

## Why This Matters to the Learner
The creator personally experienced the fatigue and time wasted trying to organize messy thoughts into buildable projects. Building this eliminates that barrier for themselves and other builders.

## What "Working" Looks Like
In the 1–2 minute Devpost demo video:
1. The user types or pastes an unorganized idea (e.g., a rough concept for a fitness tracker).
2. Hits "Break it down".
3. A smooth loading indicator appears, followed by structured, readable cards containing:
   - 3–5 phase roadmap
   - 4–6 concrete next steps
   - Recommended tech stack with plain-English rationales
   - 2–4 free learning resources
   - Practical guidance on how to prompt an AI coding agent
4. An easy "Copy Blueprint" action to paste directly into an AI agent.

## The POC Boundary (Now)
- Single-page Next.js + TypeScript application with Tailwind styling.
- Large, inviting text input with sample prompt chips for quick testing.
- Reliable breakdown generation using a free LLM strategy (Google Gemini free tier with smart fallback templates).
- Structured display cards with copy capability.
- Robust loading and error handling.

## Later
- Support for Content Creators & Writers (transforming messy thoughts into article outlines, video scripts, and content schedules).
- Interactive follow-up questions to refine the generated plan.
- Personalized coaching timeline and calendar pacing.
- User accounts and progress tracking on return visits.

## Explicitly Cut
- User registration and authentication (adds complexity without proving the core value).
- Persistent database backend (unnecessary for the single-session PoC).
- Paid API keys or external subscriptions (violates hackathon rules).
