import { NextRequest, NextResponse } from "next/server";
import { ClarifyingQuestion } from "@/types/blueprint";
import { getClarifyingQuestions } from "@/lib/fallbackGenerator";

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

const QUESTIONS_SYSTEM_PROMPT = `You are a Principal Software Engineering Mentor.
A hackathon beginner has entered their project idea.
To help them build a rock-solid Phase 1 proof-of-concept without getting overwhelmed by infrastructure, generate exactly 2 adaptive clarifying questions with 2-3 concrete multiple-choice options each.

Questions must focus on critical Phase 1 architectural trade-offs:
1. Interaction mode or demo workflow
2. Data storage or zero-infrastructure persistence policy
Make sure one option in each question has "recommendation": true for the beginner-friendly MVP path.

Output MUST be 100% valid JSON matching this schema:
[
  {
    "id": "string (slug like 'storage_strategy')",
    "title": "string (question title)",
    "helper": "string (1 sentence explaining why this choice matters for Phase 1)",
    "options": [
      {
        "id": "string",
        "label": "string",
        "recommendation": boolean
      }
    ]
  }
]`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idea } = body;

    if (!idea || typeof idea !== "string" || idea.trim().length < 8) {
      return NextResponse.json(
        { error: "Idea of at least 8 characters is required." },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      const fallbackQuestions = getClarifyingQuestions(idea);
      return NextResponse.json({ success: true, questions: fallbackQuestions });
    }

    let adaptiveQuestions: ClarifyingQuestion[] | null = null;

    for (const model of GEMINI_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${QUESTIONS_SYSTEM_PROMPT}\n\nPROJECT IDEA:\n"${idea.trim()}"` }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) continue;

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          adaptiveQuestions = parsed.map((q: any, i: number) => ({
            id: q.id || `q_${i + 1}`,
            title: q.title || `Architectural Decision ${i + 1}`,
            helper: q.helper || "Calibrates your Phase 1 cutline.",
            options: Array.isArray(q.options)
              ? q.options.map((opt: any) => ({
                  id: opt.id || `opt_${Math.random().toString(36).substring(2, 6)}`,
                  label: opt.label || "Standard implementation",
                  recommendation: Boolean(opt.recommendation),
                }))
              : [
                  { id: "opt_standard", label: "Zero-database offline local storage", recommendation: true },
                  { id: "opt_cloud", label: "Cloud database setup" },
                ],
          }));
          break;
        }
      } catch (err: any) {
        console.warn(`[Questions Route] Model ${model} failed:`, err?.message);
      }
    }

    if (!adaptiveQuestions || adaptiveQuestions.length === 0) {
      adaptiveQuestions = getClarifyingQuestions(idea);
    }

    return NextResponse.json({
      success: true,
      questions: adaptiveQuestions,
    });
  } catch (err: any) {
    console.error("[Questions Route] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to generate adaptive questions." },
      { status: 500 }
    );
  }
}
