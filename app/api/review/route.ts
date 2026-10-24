import { NextRequest, NextResponse } from "next/server";
import { RoadmapNode, StepReviewResult } from "@/types/blueprint";
import { verifyArtifact } from "@/lib/artifactVerifier";
import { sanitizeLogMessage } from "@/lib/redact";

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

const MENTOR_SYSTEM_PROMPT = `You are a Principal Software Engineering Mentor and Hackathon Pair-Programming Coach.
Your student is building a hackathon proof-of-concept project.
They are working on a specific architectural milestone and have submitted their work (code snippet, terminal output, or question) for verification.

Evaluate their submission thoroughly against the milestone's Goal, Target Files, and Key Packages.
Provide actionable, encouraging, and technically precise feedback.

Output MUST be 100% valid JSON matching this schema:
{
  "verdict": "passed" | "needs_work" | "warning",
  "verdictLabel": "string (e.g. '✓ VERIFIED & APPROVED', '⚠️ ADJUSTMENTS NEEDED', or '✦ COACHING INSIGHT')",
  "feedback": "string (2-3 sentences explaining the assessment in plain language)",
  "positivePoints": ["string (1-2 specific things they did right)"],
  "suggestedFixes": ["string (1-2 concrete code or setup fixes, if any)"],
  "nextTip": "string (Exact next action to take to transition to the next step)"
}`;

function buildFallbackReview(milestone: RoadmapNode, submission: string): StepReviewResult {
  const hasCode = submission.includes("import") || submission.includes("interface") || submission.includes("const") || submission.includes("export");
  const isShort = submission.trim().length < 40;

  if (isShort) {
    return {
      stepId: milestone.id,
      verdict: "needs_work",
      verdictLabel: "⚠️ MORE DETAIL NEEDED",
      feedback: `Your submission for Step ${milestone.step} (${milestone.title}) is quite brief. To verify your progress, paste your code from ${milestone.filesToCreate.join(" or ")} or share your terminal test output.`,
      positivePoints: ["You have reached the verification stage for this milestone."],
      suggestedFixes: [
        `Ensure you scaffolded ${milestone.filesToCreate[0] || "the target file"}.`,
        "Run your local development server to test for compile errors.",
      ],
      nextTip: `Copy the Step Prompt for Step ${milestone.step} into your coding agent, then paste the generated code back here.`,
      timestamp: Date.now(),
    };
  }

  return {
    stepId: milestone.id,
    verdict: "passed",
    verdictLabel: "✓ STEP VERIFIED",
    feedback: `Good progress on Step ${milestone.step}: ${milestone.title}. Your submission aligns with the objective to ${milestone.goal.toLowerCase()}`,
    positivePoints: [
      `Files targeted: ${milestone.filesToCreate.join(", ")}`,
      hasCode ? "Code structure contains proper declarations and exports." : "Clear verification notes provided.",
    ],
    suggestedFixes: [
      "Verify that all exports match your TypeScript interfaces.",
    ],
    nextTip: `You are ready to mark Step ${milestone.step} as done and proceed to the next milestone!`,
    timestamp: Date.now(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }
    const { idea, milestone, submission, submissionType, filename } = body;

    if (submission !== undefined && typeof submission === "string" && submission.length > 8000) {
      return NextResponse.json(
        { error: "Submission exceeds maximum allowed length of 8,000 characters." },
        { status: 400 }
      );
    }

    if (idea !== undefined && (typeof idea !== "string" || idea.length > 1500)) {
      return NextResponse.json(
        { error: "Project idea must be a string not exceeding 1,500 characters." },
        { status: 400 }
      );
    }

    if (filename !== undefined && (typeof filename !== "string" || filename.length > 255)) {
      return NextResponse.json(
        { error: "Filename must be a string not exceeding 255 characters." },
        { status: 400 }
      );
    }

    if (submissionType !== undefined && (typeof submissionType !== "string" || submissionType.length > 50)) {
      return NextResponse.json(
        { error: "Submission type must be a string not exceeding 50 characters." },
        { status: 400 }
      );
    }

    if (milestone !== undefined && (typeof milestone !== "object" || milestone === null || Array.isArray(milestone))) {
      return NextResponse.json(
        { error: "Milestone must be an object." },
        { status: 400 }
      );
    }

    // Explicit deterministic artifact verification path
    const isArtifact =
      submissionType === "artifact" ||
      (typeof filename === "string" && filename.trim().length > 0);

    if (isArtifact) {
      if (!milestone || !milestone.id) {
        return NextResponse.json(
          { error: "Milestone is required for artifact verification." },
          { status: 400 }
        );
      }
      const targetFilename =
        typeof filename === "string" && filename.trim()
          ? filename.trim()
          : "manifest.json";
      const targetContent = typeof submission === "string" ? submission : "";
      const reviewResult = verifyArtifact(
        targetFilename,
        targetContent,
        milestone.id
      );

      return NextResponse.json({
        success: true,
        source: "deterministic",
        review: reviewResult,
      });
    }

    if (!milestone || !submission || typeof submission !== "string" || submission.trim().length < 5) {
      return NextResponse.json(
        { error: "Milestone and submission text (at least 5 chars) are required." },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      // Offline fallback review
      const fallbackResult = buildFallbackReview(milestone, submission);
      return NextResponse.json({ success: true, review: fallbackResult });
    }

    const promptText = `PROJECT CONTEXT:
"${idea || "Software Proof of Concept"}"

CURRENT MILESTONE:
- Step Number: ${milestone.step}
- Title: ${milestone.title}
- Goal: ${milestone.goal}
- Target Files: ${(milestone.filesToCreate || []).join(", ")}
- Packages: ${(milestone.keyPackages || []).join(", ")}

LEARNER'S SUBMISSION (${submissionType || "code"}):
"""
${submission.trim()}
"""

Provide your structured mentor evaluation in JSON matching the schema.`;

    let reviewResult: StepReviewResult | null = null;

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
                parts: [{ text: `${MENTOR_SYSTEM_PROMPT}\n\n${promptText}` }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
          signal: AbortSignal.timeout(18000),
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
        reviewResult = {
          stepId: milestone.id,
          verdict: parsed.verdict === "needs_work" || parsed.verdict === "warning" ? parsed.verdict : "passed",
          verdictLabel: parsed.verdictLabel || (parsed.verdict === "passed" ? "✓ VERIFIED & APPROVED" : "⚠️ ADJUSTMENTS NEEDED"),
          feedback: parsed.feedback || "Milestone reviewed successfully.",
          positivePoints: Array.isArray(parsed.positivePoints) ? parsed.positivePoints : ["Progress confirmed."],
          suggestedFixes: Array.isArray(parsed.suggestedFixes) ? parsed.suggestedFixes : [],
          nextTip: parsed.nextTip || `Proceed to Step ${milestone.step + 1}.`,
          timestamp: Date.now(),
        };
        break;
      } catch (err: any) {
        console.warn(`[Review Route] Model ${model} failed:`, sanitizeLogMessage(err));
      }
    }

    if (!reviewResult) {
      reviewResult = buildFallbackReview(milestone, submission);
    }

    return NextResponse.json({
      success: true,
      review: reviewResult,
    });
  } catch (err: any) {
    console.error("[Review Route] Unexpected error:", sanitizeLogMessage(err));
    return NextResponse.json(
      { error: "Failed to evaluate step submission." },
      { status: 500 }
    );
  }
}
