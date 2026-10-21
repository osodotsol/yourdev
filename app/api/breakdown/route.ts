import { NextRequest, NextResponse } from "next/server";
import { generateGeminiBlueprint } from "@/lib/gemini";
import { generateBlueprint as generateFallbackBlueprint } from "@/lib/fallbackGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idea, choices } = body;

    if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
      return NextResponse.json(
        { error: "Idea must be at least 10 characters." },
        { status: 400 }
      );
    }

    // Attempt Live Gemini with 28s timeout
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API call timed out after 28s")), 28000)
      );

      const blueprint = await Promise.race([
        generateGeminiBlueprint(idea, choices),
        timeoutPromise,
      ]);

      return NextResponse.json({
        success: true,
        source: "gemini",
        blueprint,
      });
    } catch (apiError: any) {
      console.warn("[Breakdown Route] Gemini API failed, falling back to local heuristic:", apiError?.message);

      // Graceful fallback to client heuristic
      const fallbackBlueprint = generateFallbackBlueprint(idea, choices);
      return NextResponse.json({
        success: true,
        source: "fallback",
        blueprint: fallbackBlueprint,
        notice: "Generated with offline fallback engine due to temporary API latency.",
      });
    }
  } catch (err: any) {
    console.error("[Breakdown Route] Unexpected server error:", err);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
