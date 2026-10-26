import { ChatProjectContext } from "@/types/chat";

/**
 * Generates honest, deterministic offline coding mentor guidance when GEMINI_API_KEY
 * is not configured.
 *
 * Adheres strictly to the task guidelines:
 * - Does NOT fabricate live AI answers.
 * - Clearly discloses offline heuristic mode.
 * - Prioritizes beginner-friendly explanations, concrete next steps, and grounded suggestions.
 * - Distinguishes verified facts from hypotheses.
 * - Never claims to see files or terminal output that was not supplied in context.
 */
export function generateOfflineMentorGuidance(
  message: string,
  context?: ChatProjectContext
): { reply: string; isOffline: true; offlineNotice: string } {
  const query = (message || "").toLowerCase().trim();
  const projectTitle = context?.projectTitle || "Your Project";
  const activeMilestone = context?.activeMilestone;
  const recentVerification = context?.recentVerification;
  const errorMsg = context?.userErrorMessage || "";
  const codeExcerpt = context?.userCodeExcerpt || "";

  let reply = "";

  // 1. Diagnosing an explicit or supplied verification failure
  if (
    recentVerification &&
    !recentVerification.passed &&
    (query.includes("fail") ||
      query.includes("verify") ||
      query.includes("test") ||
      query.includes("fix") ||
      query.includes("wrong") ||
      query.includes("error"))
  ) {
    const failedChecks = recentVerification.failedChecks || [];
    reply = `### Diagnosing Recent Verification Failure for ${projectTitle}

**Observed Status:** Automated verification reported ${failedChecks.length} unmet check(s).

${
  failedChecks.length > 0
    ? `**Unmet checks to address:**\n${failedChecks.map((c) => `- \`${c}\``).join("\n")}`
    : "**Verification notice:** The component metrics did not match the expected assertion values."
}

**Root Cause Analysis:**
In beginner projects, verification failures commonly stem from **state synchronization mismatch** or **premature secondary state** (e.g., maintaining a separate percentage state rather than calculating directly from the items array during render).

**Recommended Next Step:**
1. Check your source data array before performing mathematical operations to prevent \`NaN\` or divide-by-zero errors:
   \`\`\`typescript
   const total = items.length;
   const completed = items.filter(i => i.completed).length;
   const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
   \`\`\`
2. Re-run your verification check in the workspace once the calculation is derived from single-source truth.`;
  }
  // 2. Diagnosing user-supplied error message or code crash
  else if (
    errorMsg.length > 0 ||
    query.includes("error") ||
    query.includes("bug") ||
    query.includes("crash") ||
    query.includes("cannot read") ||
    query.includes("undefined") ||
    query.includes("nan") ||
    query.includes("syntaxerror")
  ) {
    const specificError = errorMsg ? `\`${errorMsg.slice(0, 200)}\`` : "the reported runtime error";
    reply = `### Error Troubleshooting Guidance

**Reported issue:** ${specificError}

**Step-by-step diagnostic checklist:**
1. **Null / Undefined Guarding:** Ensure objects and arrays are initialized before reading properties. In React, initial state may be empty on first render:
   \`\`\`typescript
   const safeCount = items?.length ?? 0;
   \`\`\`
2. **Derived State vs. Stored State:** Avoid storing values that can be derived on the fly. If state depends on another state variable, calculate it inline during rendering.
3. **Inspect Target Files:** Verify your declarations in ${
      activeMilestone?.filesToCreate && activeMilestone.filesToCreate.length > 0
        ? activeMilestone.filesToCreate.map((f) => `\`${f}\``).join(" and ")
        : "your component file"
    }.

**Hypothesis vs. Fact:**
I can only inspect the text and errors you explicitly provide. If the error persists after these checks, paste the exact line numbers and component declaration for more targeted guidance.`;
  }
  // 3. Guidance on what to do next / active milestone
  else if (
    query.includes("next") ||
    query.includes("start") ||
    query.includes("step") ||
    query.includes("build") ||
    query.includes("milestone") ||
    query.includes("todo")
  ) {
    if (activeMilestone) {
      reply = `### Active Milestone: Step ${activeMilestone.step} — ${activeMilestone.title}

**Goal:** ${activeMilestone.goal}

**Files to create or edit:**
${(activeMilestone.filesToCreate || ["Target component"]).map((f) => `- \`${f}\``).join("\n")}

**Definition of Done:**
${(activeMilestone.definitionOfDone || ["Implement core functionality"]).map((d) => `- [ ] ${d}`).join("\n")}

**Suggested Small Action:**
Start by scaffolding the minimal interface in \`${activeMilestone.filesToCreate?.[0] || "your target file"}\`. Once the structure compiles cleanly, paste the code into the verification panel to verify it step by step.`;
    } else {
      reply = `### Next Step for ${projectTitle}

To make steady progress without getting overwhelmed:
1. Focus on Milestone 1: get a minimal working UI visible in your browser before adding complex state or backend logic.
2. Keep your components small (less than 150 lines per file).
3. Test locally after each edit by keeping \`npm run dev\` running.`;
    }
  }
  // 4. Inquiring about tech stack or architecture
  else if (
    query.includes("stack") ||
    query.includes("tech") ||
    query.includes("react") ||
    query.includes("database") ||
    query.includes("backend") ||
    query.includes("storage") ||
    query.includes("next.js")
  ) {
    const stackSummary = context?.techStack && context.techStack.length > 0
      ? context.techStack.join(", ")
      : "Next.js App Router, React, TypeScript, and Vanilla CSS / Tailwind";

    reply = `### Architecture & Tech Stack: ${projectTitle}

**Recommended Stack:** ${stackSummary}

**Why this architecture works for beginners:**
- **Single Runtime:** Everything runs locally with minimal cloud setup or external credentials required in Phase 1.
- **Client Storage:** Starting with browser \`localStorage\` or local JSON allows you to build and test the full user journey before adding cloud database overhead.
- **Predictable State:** Deriving counts directly from component state keeps your user interface fast and eliminates synchronization bugs.

**Recommended Action:**
Keep your Phase 1 MVP focused strictly on the core user journey. Avoid introducing authentication or remote databases until your primary interface is verified.`;
  }
  // 5. Default grounded mentor guidance
  else {
    reply = `### Coding Mentor Insight for ${projectTitle}

I am here to help you build, understand, and verify your software step by step.

${
  activeMilestone
    ? `**Currently focused on:** Step ${activeMilestone.step} — *${activeMilestone.title}*\n- **Milestone objective:** ${activeMilestone.goal}`
    : `**Project:** ${projectTitle}`
}

**Ways I can help you right now:**
- **Diagnose a bug:** Paste an error message or unexpected behavior.
- **Explain architecture:** Ask why a specific component or calculation is structured the way it is.
- **Next steps:** Ask for guidance on how to tackle the active milestone's definition of done.

*What specific question or code section would you like to review next?*`;
  }

  return {
    reply,
    isOffline: true,
    offlineNotice:
      "✦ Offline Mentor Mode · Active project guidance generated from local blueprint and deterministic rules. Configure GEMINI_API_KEY in .env.local to enable live conversational AI.",
  };
}
