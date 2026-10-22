import {
  IdeaBlueprint,
  RoadmapNode,
  PitfallItem,
  BlueprintPhase,
  NextAction,
  StackItem,
} from "@/types/blueprint";
import { sanitizeResources, isValidUrl } from "@/lib/linkValidator";
import { SkillModule, buildRoadmapNodes } from "@/lib/knowledgeBank";

export interface ValidationResult {
  isValid: boolean;
  blueprint: IdeaBlueprint;
  warnings: string[];
}

/**
 * Validates raw JSON object from Gemini and safely repairs any missing
 * or malformed fields using matched knowledge bank ground truth.
 */
export function validateAndRepairBlueprint(
  raw: any,
  defaultSkill: SkillModule,
  rawIdea: string
): ValidationResult {
  const warnings: string[] = [];

  if (!raw || typeof raw !== "object") {
    warnings.push("Payload was not a valid JSON object; falling back to knowledge bank.");
    const fallbackNodes = buildRoadmapNodes(defaultSkill, "Proof of Concept", rawIdea);
    return {
      isValid: false,
      blueprint: {
        projectTitle: "Proof of Concept Architecture",
        summary: rawIdea.slice(0, 160),
        strategyDecision: defaultSkill.summary,
        pitfalls: defaultSkill.pitfalls,
        roadmap: [
          { phase: "Phase 1", title: "Core Prototype", description: "Establish baseline components and local state." },
          { phase: "Phase 2", title: "Persistence", description: "Connect local storage for reliability." },
          { phase: "Phase 3", title: "Refinements", description: "Polish UI states and handle edge cases." },
          { phase: "Phase 4", title: "Demo Ready", description: "Final testing and rehearse walkthrough." },
        ],
        nextActions: [
          { step: 1, action: "Create domain types", detail: "Scaffold interface definitions." },
          { step: 2, action: "Build primary interactive view", detail: "Connect state controls." },
          { step: 3, action: "Connect storage", detail: "Persist session offline." },
          { step: 4, action: "Verify edge cases", detail: "Check empty inputs and reset flow." },
        ],
        techStack: [
          { category: "Framework", name: "Next.js 14", reason: "Standard full-stack foundation." },
          { category: "Styling", name: "Tailwind CSS", reason: "Zero runtime utility styling." },
          { category: "Language", name: "TypeScript", reason: "Strict compile-time type safety." },
        ],
        resources: defaultSkill.docs.map((d) => ({ type: "Official Docs", ...d })),
        agentGuide: {
          workflowTips: [
            "Build one verifiable slice per prompt.",
            "Verify component rendering before adding secondary features.",
          ],
          firstPrompt: `I am building this project: ${rawIdea}. Please help me scaffold Step 1 types and core components.`,
        },
        nodes: fallbackNodes,
        isFallback: true,
      },
      warnings,
    };
  }

  // 1. Project Title
  let projectTitle = typeof raw.projectTitle === "string" ? raw.projectTitle.trim() : "";
  if (!projectTitle || projectTitle.length < 3) {
    projectTitle = "Tailored Software Architecture";
    warnings.push("Missing or invalid projectTitle; repaired.");
  }

  // 2. Summary
  let summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  if (!summary || summary.length < 8) {
    summary = rawIdea.slice(0, 180);
    warnings.push("Missing or invalid summary; repaired from raw idea.");
  }

  // 3. Strategy Decision
  let strategyDecision = typeof raw.strategyDecision === "string" ? raw.strategyDecision.trim() : "";
  if (!strategyDecision) {
    strategyDecision = defaultSkill.summary;
    warnings.push("Missing strategyDecision; populated from domain knowledge.");
  }

  // 4. Pitfalls
  let pitfalls: PitfallItem[] = [];
  if (Array.isArray(raw.pitfalls) && raw.pitfalls.length > 0) {
    pitfalls = raw.pitfalls.map((p: any, idx: number) => ({
      trap: typeof p?.trap === "string" ? p.trap : `Failure mode ${idx + 1}`,
      whyItHappens: typeof p?.whyItHappens === "string" ? p.whyItHappens : "Over-optimizing or skipping verification.",
      howToAvoid: typeof p?.howToAvoid === "string" ? p.howToAvoid : "Implement minimal working prototype first.",
    }));
  } else {
    pitfalls = defaultSkill.pitfalls;
    warnings.push("Missing pitfalls array; populated from domain knowledge.");
  }

  // 5. Roadmap Nodes
  let nodes: RoadmapNode[] = [];
  if (Array.isArray(raw.nodes) && raw.nodes.length >= 3) {
    nodes = raw.nodes.map((n: any, idx: number) => {
      const stepNum = typeof n?.step === "number" ? n.step : idx + 1;
      const files: string[] = Array.isArray(n?.filesToCreate)
        ? n.filesToCreate.filter((f: any) => typeof f === "string" && f.trim().length > 0)
        : [`src/step${stepNum}.ts`];

      const rawDocs = Array.isArray(n?.resources) ? n.resources : defaultSkill.docs;
      const sanitizedDocs = rawDocs
        .filter((d: any) => d && typeof d.title === "string")
        .map((d: any) => ({
          title: d.title.trim(),
          url: isValidUrl(d.url) ? d.url.trim() : defaultSkill.docs[0]?.url || "https://developer.mozilla.org",
        }));

      return {
        id: typeof n?.id === "string" ? n.id : `node-${stepNum}`,
        step: stepNum,
        title: typeof n?.title === "string" ? n.title : `Milestone 0${stepNum}`,
        subtitle: typeof n?.subtitle === "string" ? n.subtitle : "Implementation step",
        badge: (n?.badge === "RECOMMENDED" || n?.badge === "POLISH" ? n.badge : "CORE MVP") as
          | "CORE MVP"
          | "RECOMMENDED"
          | "POLISH",
        goal: typeof n?.goal === "string" ? n.goal : "Complete this architectural milestone cleanly.",
        filesToCreate: files.length > 0 ? files : [`types/step${stepNum}.ts`],
        keyPackages: Array.isArray(n?.keyPackages) ? n.keyPackages : defaultSkill.recommendedPackages.slice(0, 3),
        stepPrompt:
          typeof n?.stepPrompt === "string" && n.stepPrompt.trim().length > 20
            ? n.stepPrompt.trim()
            : `I am building ${projectTitle}. We are executing Step ${stepNum}. Please create ${files.join(", ")} with complete code.`,
        resources: sanitizedDocs.length > 0 ? sanitizedDocs : defaultSkill.docs,
      };
    });
  } else {
    nodes = buildRoadmapNodes(defaultSkill, projectTitle, summary);
    warnings.push("Missing nodes array; populated from standard domain nodes.");
  }

  // 6. Phased Roadmap
  let roadmap: BlueprintPhase[] = [];
  if (Array.isArray(raw.roadmap) && raw.roadmap.length > 0) {
    roadmap = raw.roadmap.map((r: any, idx: number) => ({
      phase: typeof r?.phase === "string" ? r.phase : `Phase ${idx + 1}`,
      title: typeof r?.title === "string" ? r.title : `Milestone ${idx + 1}`,
      description: typeof r?.description === "string" ? r.description : "Execute milestone tasks.",
    }));
  } else {
    roadmap = nodes.map((n) => ({
      phase: `Phase ${n.step}`,
      title: n.title,
      description: n.goal,
    }));
  }

  // 7. Next Actions
  let nextActions: NextAction[] = [];
  if (Array.isArray(raw.nextActions) && raw.nextActions.length > 0) {
    nextActions = raw.nextActions.map((a: any, idx: number) => ({
      step: typeof a?.step === "number" ? a.step : idx + 1,
      action: typeof a?.action === "string" ? a.action : `Step ${idx + 1}`,
      detail: typeof a?.detail === "string" ? a.detail : "Implement specified files.",
    }));
  } else {
    nextActions = nodes.map((n) => ({
      step: n.step,
      action: n.title,
      detail: n.filesToCreate.join(", "),
    }));
  }

  // 8. Tech Stack
  let techStack: StackItem[] = [];
  if (Array.isArray(raw.techStack) && raw.techStack.length > 0) {
    techStack = raw.techStack.map((s: any) => ({
      category: typeof s?.category === "string" ? s.category : "Technology",
      name: typeof s?.name === "string" ? s.name : "Tool",
      reason: typeof s?.reason === "string" ? s.reason : "Chosen for rapid PoC delivery.",
    }));
  } else {
    techStack = [
      { category: defaultSkill.category, name: defaultSkill.name, reason: "Curated framework choice." },
      { category: "Language", name: "TypeScript", reason: "Type safety prevents runtime edge bugs." },
    ];
  }

  // 9. Resources (Sanitized)
  const resources = sanitizeResources(raw.resources || defaultSkill.docs);

  // 10. Agent Guide
  const rawGuide = raw.agentGuide || {};
  const agentGuide = {
    workflowTips: Array.isArray(rawGuide.workflowTips) && rawGuide.workflowTips.length > 0
      ? rawGuide.workflowTips.map((t: any) => String(t))
      : [
          "Prompt your coding agent one small file at a time.",
          "Verify the file in your browser before proceeding to the next step.",
        ],
    firstPrompt: typeof rawGuide.firstPrompt === "string" && rawGuide.firstPrompt.trim().length > 30
      ? rawGuide.firstPrompt.trim()
      : `I am building ${projectTitle}. PROJECT GOAL: ${summary}. Let's begin with Step 1: ${nodes[0]?.title}. Create ${nodes[0]?.filesToCreate.join(", ")}.`,
  };

  const blueprint: IdeaBlueprint = {
    projectTitle,
    summary,
    strategyDecision,
    pitfalls,
    roadmap,
    nextActions,
    techStack,
    resources,
    agentGuide,
    nodes,
    isFallback: false,
  };

  return {
    isValid: warnings.length === 0,
    blueprint,
    warnings,
  };
}
