import { IdeaBlueprint, LearnerProfileAnswers, ProjectArchitecture } from "@/types/blueprint";
import { retrieveKnowledge } from "@/lib/knowledgeBank";
import { validateAndRepairBlueprint, validateAndRepairArchitecture } from "@/lib/validateBlueprint";
import { generateFallbackArchitecture } from "@/lib/fallbackGenerator";
import { FOUNDATIONS_BANK } from "@/lib/foundationsBank";
import { sanitizeLogMessage } from "@/lib/redact";

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

const ARCHITECTURE_SYSTEM_PROMPT = `You are a Principal Software Engineering Mentor and Pair-Programming Coach for beginners.
Before anything else is built, analyze the user's idea and generate a structured, validated architectural decomposition.

CRITICAL RULES:
1. Identify the exact project_type: strictly one of "web app", "mobile app", "bot", "CLI", "data/script", "game", "other".
2. Recommend a beginner-friendly tech stack:
   - language (e.g. "JavaScript (Node.js)", "Python", "TypeScript")
   - framework_or_tools: 2-4 beginner-friendly packages
   - why_in_plain_english: explain in 1-2 plain sentences with no jargon
   - alternatives: 2 alternatives with specific criteria ("pick_this_if")
3. Explain front end vs back end simply in plain language tailored to THIS specific project type.
4. Break into 3 to 7 concrete PARTS derived strictly from THIS idea:
   - DO NOT force web-app parts onto non-web ideas! (e.g. a Discord bot has chat slash commands/embeds as front end, scheduler/storage as back end; a CLI has flags/ASCII output as front end, parser/calculator as back end).
   - Each part MUST have:
     - id: unique kebab-case string (e.g. "slash-commands", "csv-parser")
     - name: clear title
     - one_line_purpose: 1 plain English sentence
     - side: strictly one of "front end (what the user sees)", "back end (works behind the scenes)", "both"
     - depends_on: array of part ids this part depends on
     - example_look_feel_function: concrete 1-2 sentence example showing how this part looks, feels, and functions in real life
     - steps: 2-3 specific beginner build steps
     - resources: 1-2 curated resources for non-developers
5. Preview of finished product: 1-2 sentences describing what the user actually experiences when the finished project runs.
6. Output MUST be 100% valid JSON matching the schema below with NO markdown backticks.

SCHEMA:
{
  "project_type": "web app" | "mobile app" | "bot" | "CLI" | "data/script" | "game" | "other",
  "front_back_explained_simply": "string",
  "recommended_stack": {
    "language": "string",
    "framework_or_tools": ["string"],
    "why_in_plain_english": "string",
    "alternatives": [
      { "name": "string", "pick_this_if": "string" }
    ]
  },
  "parts": [
    {
      "id": "string",
      "name": "string",
      "one_line_purpose": "string",
      "side": "front end (what the user sees)" | "back end (works behind the scenes)" | "both",
      "depends_on": ["string"],
      "example_look_feel_function": "string",
      "steps": ["string"],
      "resources": [
        { "title": "string", "url": "string", "why": "string" }
      ]
    }
  ],
  "finished_product_preview": "string"
}`;

export interface ClassifyProjectOptions {
  signal?: AbortSignal;
  mockArchitecture?: ProjectArchitecture;
  mockDelayMs?: number;
  simulateFailure?: boolean;
}

/**
 * Make one dedicated model call returning validated project architecture & decomposition
 * before anything else is generated.
 */
export async function classifyAndDecomposeProject(
  ideaText: string,
  userChoices: Record<string, string> = {},
  apiKey?: string,
  signalOrOptions?: AbortSignal | ClassifyProjectOptions
): Promise<{ architecture: ProjectArchitecture; source: "model" | "fallback" }> {
  const options: ClassifyProjectOptions =
    signalOrOptions && typeof signalOrOptions === "object" && "aborted" in signalOrOptions
      ? { signal: signalOrOptions as AbortSignal }
      : (signalOrOptions as ClassifyProjectOptions) || {};
  const signal = options.signal;

  if (options.simulateFailure) {
    throw new Error("Simulated architecture classification failure");
  }

  if (options.mockDelayMs && options.mockDelayMs > 0) {
    await new Promise<void>((resolve, reject) => {
      const delayTimer = setTimeout(resolve, options.mockDelayMs);
      if (signal) {
        if (signal.aborted) {
          clearTimeout(delayTimer);
          const abortErr: any = signal.reason || new Error("Architecture classification aborted");
          abortErr.name = "AbortError";
          reject(abortErr);
          return;
        }
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(delayTimer);
            const abortErr: any = signal?.reason || new Error("Architecture classification aborted");
            abortErr.name = "AbortError";
            reject(abortErr);
          },
          { once: true }
        );
      }
    });
  }

  if (options.mockArchitecture) {
    const validation = validateAndRepairArchitecture(options.mockArchitecture, ideaText);
    return {
      architecture: validation.architecture,
      source: validation.isModel ? "model" : "fallback",
    };
  }

  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    console.info("[Architecture API] No GEMINI_API_KEY, using domain fallback.");
    return {
      architecture: generateFallbackArchitecture(ideaText, userChoices),
      source: "fallback",
    };
  }

  const promptContent = `PROJECT IDEA:
"${ideaText}"

USER ARCHITECTURAL CHOICES:
${JSON.stringify(userChoices, null, 2)}

Analyze this idea and return the validated JSON architectural decomposition adhering strictly to the schema.`;

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
              parts: [{ text: `${ARCHITECTURE_SYSTEM_PROMPT}\n\n${promptContent}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
        signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${res.status}`;
        console.warn(`[Architecture API] Model ${model} failed:`, sanitizeLogMessage(errMsg));
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const rawObj = JSON.parse(cleaned);
      const validation = validateAndRepairArchitecture(rawObj, ideaText);

      return {
        architecture: validation.architecture,
        source: validation.isModel ? "model" : "fallback",
      };
    } catch (err: any) {
      if (err?.name === "AbortError" || signal?.aborted) {
        throw err;
      }
      console.warn(`[Architecture API] Attempt with ${model} error:`, sanitizeLogMessage(err));
    }
  }

  console.warn("[Architecture API] All models failed, falling back to local heuristic.");
  return {
    architecture: generateFallbackArchitecture(ideaText, userChoices),
    source: "fallback",
  };
}

const SYSTEM_PROMPT = `You are a Principal Software Engineering Mentor and Pair-Programming Coach for beginners.
Your mission is to take a raw tech idea and turn it into a structured, beginner-friendly learning roadmap and proof-of-concept build plan.

CRITICAL INSTRUCTIONS:
1. BEGINNER-FIRST TONE: Do NOT jump straight to databases, complex auth, or deployment overhead. Keep the main MVP path 100% offline-first and zero-auth (local files or localStorage).
2. EXPLAIN PLAINLY: Define any technical term the first time it appears with an intuitive real-world analogy.
3. ADHERE TO ARCHITECTURE & PARTS: The project architecture, project_type, recommended stack, and parts are pre-classified. Your roadmap milestones and product map MUST derive directly from these parts!
4. COVERAGE RULE: Every feature mentioned in the project summary MUST map to productMap.mvpVsLater.v1DemoReady, v2Next, v3Future, or outOfScopeWithReasons with an honest explanation. Never promise features that aren't built in v1.
5. MILESTONE CAPS:
   - Max 3 target files per milestone.
   - Max 90 minutes per milestone.
   - Each milestone MUST include definitionOfDone (1-2 observable checks) and conceptToLearn.
6. PROMPT RULE: Every milestone stepPrompt MUST end with:
   "Explain your architectural decisions in plain language before writing code. Build ONLY this single milestone and STOP after this step so I can verify the changes."
7. Output MUST be 100% valid JSON matching the schema below with NO markdown backticks or outside commentary.

SCHEMA:
{
  "projectTitle": "string (clear, authentic project name)",
  "summary": "string (1-2 sentences strictly defining the MVP boundaries)",
  "strategyDecision": "string (2-3 sentences explaining architectural trade-offs in plain language)",
  "first20Minutes": {
    "action": "string (single concrete setup action)",
    "why": "string (plain English reason)",
    "whatToDo": ["string (3-4 step-by-step instructions)"],
    "whatDoneLooksLike": "string (what the user actually observes in their terminal/editor)",
    "starterTerminalCommand": "string"
  },
  "productMap": {
    "whatItDoes": "string (1 sentence)",
    "userJourney": ["string (3-5 user steps from user's point of view)"],
    "screens": [{ "name": "string", "userAction": "string" }],
    "dataItNeeds": {
      "description": "string (plain English description of user data)",
      "storageForMvp": "string (e.g. Local file or Browser localStorage - zero server setup)",
      "laterOptions": "string (cloud database with accounts - deferred to Level Up Later)"
    },
    "partsYouNeedNow": [{ "part": "string", "reason": "string" }],
    "partsYouCanIgnoreForNow": [{ "part": "string", "reason": "string (why databases/auth/payments can wait)" }],
    "mvpVsLater": {
      "v1DemoReady": ["string"],
      "v2Next": ["string"],
      "v3Future": ["string"],
      "outOfScopeWithReasons": [{ "feature": "string", "reason": "string" }]
    },
    "nextImplementationSteps": [{ "step": "string", "reason": "string" }]
  },
  "nodes": [
    {
      "id": "node-1",
      "step": 1,
      "title": "string (Milestone matching Part 1)",
      "subtitle": "string",
      "badge": "CORE MVP",
      "goal": "string",
      "definitionOfDone": ["string (1-2 observable checks)"],
      "conceptToLearn": "string (plain English concept)",
      "estimatedMinutes": 45,
      "requiredFoundations": ["git_basics", "js_basics"],
      "filesToCreate": ["string (max 3 files)"],
      "keyPackages": ["string"],
      "stepPrompt": "string (ends with prompt rule)",
      "resources": [{ "title": "string", "url": "string" }]
    },
    {
      "id": "node-2",
      "step": 2,
      "title": "string (Milestone matching Part 2)",
      "subtitle": "string",
      "badge": "CORE MVP",
      "goal": "string",
      "definitionOfDone": ["string"],
      "conceptToLearn": "string",
      "estimatedMinutes": 60,
      "requiredFoundations": ["storing_data"],
      "filesToCreate": ["string (max 3 files)"],
      "keyPackages": ["string"],
      "stepPrompt": "string",
      "resources": [{ "title": "string", "url": "string" }]
    },
    {
      "id": "node-3",
      "step": 3,
      "title": "string (Milestone matching Part 3)",
      "subtitle": "string",
      "badge": "RECOMMENDED",
      "goal": "string",
      "definitionOfDone": ["string"],
      "conceptToLearn": "string",
      "estimatedMinutes": 45,
      "requiredFoundations": ["storing_data"],
      "filesToCreate": ["string (max 3 files)"],
      "keyPackages": ["string"],
      "stepPrompt": "string",
      "resources": [{ "title": "string", "url": "string" }]
    },
    {
      "id": "node-4",
      "step": 4,
      "title": "string (Milestone matching Part 4)",
      "subtitle": "string",
      "badge": "POLISH",
      "goal": "string",
      "definitionOfDone": ["string"],
      "conceptToLearn": "string",
      "estimatedMinutes": 45,
      "requiredFoundations": ["ai_agent_safety"],
      "filesToCreate": ["string (max 3 files)"],
      "keyPackages": ["string"],
      "stepPrompt": "string",
      "resources": [{ "title": "string", "url": "string" }]
    }
  ],
  "pitfalls": [
    {
      "trap": "string",
      "whyItHappens": "string",
      "howToAvoid": "string"
    }
  ],
  "techStack": [
    { "category": "string", "name": "string", "reason": "string" }
  ],
  "resources": [
    { "type": "string", "title": "string", "url": "string" }
  ],
  "agentGuide": {
    "workflowTips": ["string"],
    "firstPrompt": "string"
  }
}`;

export interface GenerateGeminiOptions {
  mockArchitecture?: ProjectArchitecture;
  mockBlueprint?: IdeaBlueprint;
  mockDelayMs?: number;
  simulateFailure?: "call1" | "call2" | "all" | boolean;
  signal?: AbortSignal;
  context?: {
    retainedArchitecture?: ProjectArchitecture;
    archSource?: "model" | "fallback";
  };
}

export async function generateGeminiBlueprint(
  ideaText: string,
  userChoices: Record<string, string> = {},
  apiKey?: string,
  options?: GenerateGeminiOptions
): Promise<IdeaBlueprint> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (options?.simulateFailure === "all" || options?.simulateFailure === true) {
    throw new Error("Simulated upstream model latency timeout (test)");
  }

  let architecture: ProjectArchitecture;
  let archSource: "model" | "fallback" = "fallback";

  if (options?.mockArchitecture) {
    const val = validateAndRepairArchitecture(options.mockArchitecture, ideaText);
    architecture = val.architecture;
    archSource = val.isModel ? "model" : "fallback";
    if (options.context) {
      if (archSource === "model") {
        options.context.retainedArchitecture = architecture;
      }
      options.context.archSource = archSource;
    }
  } else if (options?.simulateFailure === "call1") {
    console.warn("[Gemini API] Simulating Call 1 failure for test.");
    const simCall1Err: any = new Error("Simulated Call 1 failure: classification model unavailable.");
    // archSource is fallback; no architecture retained
    throw simCall1Err;
  } else {
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    // 1. MAKE DEDICATED MODEL CALL FOR ARCHITECTURE FIRST
    const call1Result = await classifyAndDecomposeProject(
      ideaText,
      userChoices,
      key,
      options?.signal
    ).catch((err) => {
      if (err?.name === "AbortError" || options?.signal?.aborted) {
        throw err;
      }
      console.warn("[Gemini API] Architecture call failed, falling back to local heuristic:", sanitizeLogMessage(err));
      return {
        architecture: generateFallbackArchitecture(ideaText, userChoices),
        source: "fallback" as const,
      };
    });

    architecture = call1Result.architecture;
    archSource = call1Result.source;

    if (options?.context) {
      if (archSource === "model") {
        options.context.retainedArchitecture = architecture;
      }
      options.context.archSource = archSource;
    }
  }

  // If testing Call 2 failure, fail immediately after Call 1 resolution
  if (options?.simulateFailure === "call2") {
    const simCall2Err: any = new Error("Simulated Call 2 failure: blueprint generation failed.");
    if (archSource === "model") {
      simCall2Err.retainedArchitecture = architecture;
    }
    throw simCall2Err;
  }

  // If mockDelayMs is configured, wait with abort listener support
  if (options?.mockDelayMs && options.mockDelayMs > 0) {
    await new Promise<void>((resolve, reject) => {
      const delayTimer = setTimeout(resolve, options.mockDelayMs);
      if (options.signal) {
        if (options.signal.aborted) {
          clearTimeout(delayTimer);
          const abortErr: any = options.signal.reason || new Error("Gemini generation aborted");
          abortErr.name = "AbortError";
          if (archSource === "model" && architecture) {
            abortErr.retainedArchitecture = architecture;
          }
          reject(abortErr);
          return;
        }
        options.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(delayTimer);
            const abortErr: any = options.signal?.reason || new Error("Gemini generation aborted");
            abortErr.name = "AbortError";
            if (archSource === "model" && architecture) {
              abortErr.retainedArchitecture = architecture;
            }
            reject(abortErr);
          },
          { once: true }
        );
      }
    });
  }

  // Map userChoices into LearnerProfileAnswers
  const learnerProfile: LearnerProfileAnswers = {
    codingStyle:
      userChoices["coding_style"] === "myself"
        ? "myself"
        : userChoices["coding_style"] === "mix"
        ? "mix"
        : "vibe",
    experienceLevel:
      userChoices["experience_level"] === "intermediate"
        ? "intermediate"
        : userChoices["experience_level"] === "beginner"
        ? "beginner"
        : "none",
    hoursPerDay:
      userChoices["time_budget"] === "light"
        ? 1
        : userChoices["time_budget"] === "weekend"
        ? 8
        : 2,
    daysAvailable:
      userChoices["time_budget"] === "light"
        ? 5
        : userChoices["time_budget"] === "weekend"
        ? 2
        : 7,
    customAnswers: userChoices,
  };

  const matchedKnowledge = retrieveKnowledge(ideaText, userChoices);

  if (options?.mockBlueprint) {
    const rawObj = { ...options.mockBlueprint };
    rawObj.architecture = architecture;
    const validation = validateAndRepairBlueprint(rawObj, matchedKnowledge[0], ideaText, learnerProfile);
    const blueprint = validation.blueprint;
    blueprint.isFallback = Boolean(rawObj.isFallback);
    blueprint.userChoices = userChoices;
    blueprint.learnerProfile = learnerProfile;
    blueprint.sourceBadges = {
      ...blueprint.sourceBadges,
      architecture: archSource,
    };
    return blueprint;
  }
  const knowledgeGroundTruth = matchedKnowledge
    .map(
      (k) => `
MODULE: ${k.name} (${k.category})
- SUMMARY: ${k.summary}
- ARCHITECTURAL RULES: ${k.architectureRules.join(" | ")}
- RECOMMENDED PACKAGES: ${k.recommendedPackages.join(", ")}
- COMMON TRAPS: ${k.pitfalls.map((p) => p.trap).join(" | ")}
`
    )
    .join("\n");

  const promptContent = `PROJECT IDEA:
"${ideaText}"

VALIDATED ARCHITECTURE (DERIVE ALL MILESTONES & PRODUCT MAP FROM THIS):
- Project Type: ${architecture.project_type}
- Recommended Stack: ${architecture.recommended_stack.language} using [${architecture.recommended_stack.framework_or_tools.join(", ")}]
- Why: ${architecture.recommended_stack.why_in_plain_english}
- Front End vs Back End: ${architecture.front_back_explained_simply}
- Parts:
${architecture.parts
  .map(
    (p, idx) =>
      `  ${idx + 1}. [${p.id}] ${p.name} (${p.side}): ${p.one_line_purpose} (Depends on: ${p.depends_on.join(", ") || "none"})`
  )
  .join("\n")}

LEARNER PROFILE & CONSTRAINTS:
- Coding Style: ${learnerProfile.codingStyle} (${learnerProfile.codingStyle === "vibe" ? "Vibe coding: directing AI agent with minimal manual syntax" : "Code along / writing code"})
- Experience Level: ${learnerProfile.experienceLevel}
- Time Budget: ${learnerProfile.hoursPerDay}h/day for ${learnerProfile.daysAvailable} days

USER ARCHITECTURAL CHOICES:
${JSON.stringify(userChoices, null, 2)}

FOUNDATIONS GROUND TRUTH MODULE IDS:
${Object.keys(FOUNDATIONS_BANK).join(", ")}

KNOWLEDGE BANK GROUND TRUTH:
${knowledgeGroundTruth}

CRITICAL: Derive the nodes and productMap strictly from the ${architecture.parts.length} parts and project type (${architecture.project_type}). Do NOT force generic web concepts onto non-web projects.
Produce a beginner-friendly blueprint adhering strictly to the JSON schema.`;

  let lastError: Error | null = null;

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
        signal: options?.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${res.status}`;
        console.warn(`[Gemini API] Model ${model} failed:`, sanitizeLogMessage(errMsg));
        lastError = new Error(errMsg);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Empty candidate response from Gemini.");
      }

      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const rawObj = JSON.parse(cleaned);
      rawObj.architecture = architecture;

      const validation = validateAndRepairBlueprint(rawObj, matchedKnowledge[0], ideaText, learnerProfile);
      const blueprint = validation.blueprint;
      blueprint.isFallback = false;
      blueprint.userChoices = userChoices;
      blueprint.learnerProfile = learnerProfile;
      blueprint.sourceBadges = {
        ...blueprint.sourceBadges,
        architecture: archSource,
      };

      if (validation.warnings.length > 0) {
        console.info(`[Gemini API] Repaired ${validation.warnings.length} fields:`, validation.warnings);
      }

      return blueprint;
    } catch (err: any) {
      if (err?.name === "AbortError" || options?.signal?.aborted) {
        const abortErr: any = err?.name === "AbortError" ? err : new Error("Gemini generation aborted");
        if (archSource === "model" && architecture) {
          abortErr.retainedArchitecture = architecture;
        }
        throw abortErr;
      }
      console.warn(`[Gemini API] Model ${model} network error:`, sanitizeLogMessage(err));
      lastError = err;
    }
  }

  const finalErr: any = lastError || new Error("All Gemini models failed to generate content.");
  if (archSource === "model" && architecture) {
    finalErr.retainedArchitecture = architecture;
  }
  throw finalErr;
}

