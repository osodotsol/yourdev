import { NextRequest, NextResponse } from "next/server";
import { generateGeminiBlueprint } from "@/lib/gemini";
import { generateBlueprint as generateFallbackBlueprint } from "@/lib/fallbackGenerator";
import { ProjectArchitecture } from "@/types/blueprint";

const DEFAULT_TIMEOUT_MS = 35000;

function isTestHookAllowed(req?: NextRequest): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  if (req?.headers.get("x-simulate-production") === "true") {
    return false;
  }
  return true;
}

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

    const testAllowed = isTestHookAllowed(req);
    const simulateFailure = testAllowed ? body.simulateFailure : undefined;
    const mockArchitecture = testAllowed ? body.mockArchitecture : undefined;
    const mockBlueprint = testAllowed ? body.mockBlueprint : undefined;
    const mockDelayMs = testAllowed && typeof body.mockDelayMs === "number" ? body.mockDelayMs : undefined;
    const timeoutMs =
      testAllowed && typeof body.timeoutMs === "number" && body.timeoutMs > 0
        ? Math.min(body.timeoutMs, DEFAULT_TIMEOUT_MS)
        : DEFAULT_TIMEOUT_MS;

    const generationContext: {
      retainedArchitecture?: ProjectArchitecture;
      archSource?: "model" | "fallback";
    } = {};

    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout | undefined;

    // Attempt Live Gemini with 35s timeout (or configurable short timeout in test mode)
    try {
      if (simulateFailure === true || simulateFailure === "all") {
        throw new Error("Simulated upstream model latency timeout (test)");
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutMsg =
            timeoutMs >= 1000
              ? `Gemini API call timed out after ${Math.round(timeoutMs / 1000)}s`
              : `Gemini API call timed out after ${timeoutMs}ms`;
          const timeoutErr = new Error(timeoutMsg);
          abortController.abort(timeoutErr);
          reject(timeoutErr);
        }, timeoutMs);
      });

      const blueprint = await Promise.race([
        generateGeminiBlueprint(idea, choices, undefined, {
          mockArchitecture,
          mockBlueprint,
          mockDelayMs,
          simulateFailure,
          signal: abortController.signal,
          context: generationContext,
        }),
        timeoutPromise,
      ]);

      return NextResponse.json({
        success: true,
        source: "gemini",
        blueprint,
      });
    } catch (apiError: any) {
      // Sanitize error message to prevent any API key leakage
      const rawError = String(apiError?.message || apiError || "Unknown error");
      const sanitizedReason = rawError
        .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
        .slice(0, 250);

      console.warn("[Breakdown Route] Gemini API unavailable, activating offline heuristic:", sanitizedReason);

      const retainedArch =
        apiError?.retainedArchitecture || generationContext.retainedArchitecture;

      // Graceful fallback to client heuristic, preserving retained architecture if valid
      const fallbackBlueprint = generateFallbackBlueprint(idea, choices, retainedArch);
      const isRetained = fallbackBlueprint.sourceBadges?.architecture === "model";

      return NextResponse.json({
        success: true,
        source: "fallback",
        blueprint: fallbackBlueprint,
        diagnostics: {
          fallbackReason: sanitizedReason,
          architectureRetained: isRetained,
        },
        notice: isRetained
          ? "Generated with offline fallback engine while preserving AI-architected project decomposition."
          : "Generated with offline fallback engine due to temporary API latency or connectivity.",
      });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    }
  } catch (err: any) {
    const sanitizedServerError = String(err?.message || err || "Internal server error")
      .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
      .slice(0, 200);
    console.error("[Breakdown Route] Unexpected server error:", sanitizedServerError);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
