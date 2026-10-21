import { IdeaBlueprint } from "@/types/blueprint";

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

const SYSTEM_PROMPT = `You are a Principal Staff Software Architect and Hackathon Pair-Programming Coach.
Your mission is to take a raw, messy, or beginner-level software project idea and transform it into a deeply strategic, customized, production-grade 5-part execution blueprint for a hackathon proof of concept.

CRITICAL INSTRUCTIONS:
1. NEVER output generic boilerplate. Do NOT output generic steps like "create project folder" or "build UI card" without project-specific context.
2. Read the user's idea carefully. If they mention specific domains (e.g., audio transcription, WhatsApp, Notion, Chrome extensions, scraping, finance, healthcare, bots), YOU MUST use actual domain-specific libraries, APIs, protocols, data models, and real-world failure modes.
3. Incorporate any user choices (e.g., preferred persistence, data source, platform) directly into the architecture.
4. Output MUST be 100% valid JSON matching the exact schema below, with NO markdown backticks or commentary outside the JSON.

SCHEMA:
{
  "projectTitle": "string (punchy, authentic project name)",
  "summary": "string (1-2 sentences strictly defining the MVP proof-of-concept boundaries)",
  "strategyDecision": "string (2-3 sentences detailing the architectural trade-offs chosen for this specific build and the proof-of-concept cutline)",
  "pitfalls": [
    {
      "trap": "string (specific technical failure mode or trap for this exact domain)",
      "whyItHappens": "string (why beginners or AI coding agents fall into this trap)",
      "howToAvoid": "string (exact code-level or architectural practice to prevent it)"
    }
  ],
  "roadmap": [
    { "phase": "Phase 1", "title": "string", "description": "string" },
    { "phase": "Phase 2", "title": "string", "description": "string" },
    { "phase": "Phase 3", "title": "string", "description": "string" },
    { "phase": "Phase 4", "title": "string", "description": "string" }
  ],
  "nextActions": [
    { "step": 1, "action": "string", "detail": "string (exact files, interfaces, or setup instructions)" },
    { "step": 2, "action": "string", "detail": "string" },
    { "step": 3, "action": "string", "detail": "string" },
    { "step": 4, "action": "string", "detail": "string" }
  ],
  "techStack": [
    { "category": "string", "name": "string", "reason": "string (technical rationale tailored to this project)" },
    { "category": "string", "name": "string", "reason": "string" },
    { "category": "string", "name": "string", "reason": "string" },
    { "category": "string", "name": "string", "reason": "string" }
  ],
  "resources": [
    { "type": "string", "title": "string", "url": "string (real official docs url)" },
    { "type": "string", "title": "string", "url": "string" },
    { "type": "string", "title": "string", "url": "string" }
  ],
  "agentGuide": {
    "workflowTips": ["string", "string", "string", "string"],
    "firstPrompt": "string (A complete, ready-to-paste prompt for Cursor/Claude/Copilot that specifies the exact stack, Phase 1 tasks, constraints, and asks the agent to write the first file and TypeScript interfaces)"
  }
}`;

export async function generateGeminiBlueprint(
  ideaText: string,
  userChoices: Record<string, string> = {},
  apiKey?: string
): Promise<IdeaBlueprint> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const promptContent = `PROJECT IDEA:
"${ideaText}"

USER ARCHITECTURAL CHOICES & CONSTRAINTS:
${JSON.stringify(userChoices, null, 2)}

Produce a custom, non-generic, high-signal execution blueprint adhering strictly to the JSON schema.`;

  let lastError: Error | null = null;

  // Try candidate models in order of priority
  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${SYSTEM_PROMPT}\n\n${promptContent}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${res.status}`;
        console.warn(`[Gemini API] Model ${model} failed: ${errMsg}`);
        lastError = new Error(errMsg);
        continue; // Try next model
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Empty candidate response from Gemini.");
      }

      // Clean possible markdown fences
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const parsed: IdeaBlueprint = JSON.parse(cleaned);
      parsed.isFallback = false;
      parsed.userChoices = userChoices;

      return parsed;
    } catch (err: any) {
      console.warn(`[Gemini API] Attempt with ${model} error:`, err?.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content.");
}
