import { NextRequest, NextResponse } from "next/server";
import { classifyAndDecomposeProject } from "@/lib/gemini";
import { generateFallbackArchitecture } from "@/lib/fallbackGenerator";

const DEFAULT_TIMEOUT_MS = 18000;

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

    if (!idea || typeof idea !== "string" || idea.trim().length < 5) {
      return NextResponse.json(
        { error: "Idea must be at least 5 characters." },
        { status: 400 }
      );
    }

    const testAllowed = isTestHookAllowed(req);
    const mockArchitecture = testAllowed ? body.mockArchitecture : undefined;
    const mockDelayMs = testAllowed && typeof body.mockDelayMs === "number" ? body.mockDelayMs : undefined;
    const simulateFailure = testAllowed && Boolean(body.simulateFailure);
    const timeoutMs =
      testAllowed && typeof body.timeoutMs === "number" && body.timeoutMs > 0
        ? Math.min(body.timeoutMs, DEFAULT_TIMEOUT_MS)
        : DEFAULT_TIMEOUT_MS;

    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutMsg =
            timeoutMs >= 1000
              ? `Architecture call timed out after ${Math.round(timeoutMs / 1000)}s`
              : `Architecture call timed out after ${timeoutMs}ms`;
          const timeoutErr = new Error(timeoutMsg);
          abortController.abort(timeoutErr);
          reject(timeoutErr);
        }, timeoutMs);
      });

      const result = await Promise.race([
        classifyAndDecomposeProject(idea, choices, undefined, {
          signal: abortController.signal,
          mockArchitecture,
          mockDelayMs,
          simulateFailure,
        }),
        timeoutPromise,
      ]);

      return NextResponse.json({
        success: true,
        source: result.source,
        architecture: result.architecture,
      });
    } catch (err: any) {
      console.warn("[Architecture Route] Model failed, using fallback:", err?.message);
      const fallbackArch = generateFallbackArchitecture(idea, choices);
      return NextResponse.json({
        success: true,
        source: "fallback",
        architecture: fallbackArch,
      });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    }
  } catch (err: any) {
    console.error("[Architecture Route] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
