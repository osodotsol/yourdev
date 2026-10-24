import { IdeaBlueprint } from "@/types/blueprint";

export function formatBlueprintMarkdown(blueprint: IdeaBlueprint): string {
  const roadmapMarkdown = blueprint.roadmap
    .map((p) => `### ${p.phase}: ${p.title}\n${p.description}`)
    .join("\n\n");

  const actionsMarkdown = blueprint.nextActions
    .map((a) => `${a.step}. **${a.action}**: ${a.detail}`)
    .join("\n");

  const pitfallsMarkdown = blueprint.pitfalls && blueprint.pitfalls.length > 0
    ? blueprint.pitfalls
        .map(
          (p, i) =>
            `### Trap ${i + 1}: ${p.trap}\n- **Why it happens:** ${p.whyItHappens}\n- **How to avoid:** ${p.howToAvoid}`
        )
        .join("\n\n")
    : "";

  const stackMarkdown = blueprint.techStack
    .map((s) => `- **${s.category} (${s.name})**: ${s.reason}`)
    .join("\n");

  const resourcesMarkdown = blueprint.resources
    .map((r) => `- [${r.title}](${r.url}) — *${r.type}*`)
    .join("\n");

  const tipsMarkdown = (blueprint.agentGuide?.workflowTips || [])
    .map((t) => `- ${t}`)
    .join("\n");

  const foundationsList = blueprint.foundations?.selectedModules || [];
  const foundationsMarkdown = foundationsList.length > 0
    ? foundationsList
        .map(
          (f) =>
            `### Module ${f.id.replace("foundation-", "")}: ${f.title} (${f.minutes}m) [${f.tier.toUpperCase()}]\n- **Summary:** ${f.plainEnglishSummary}\n- **Why for your project:** ${f.whyNeededForProject || ""}\n- **Done when:** ${f.youreDoneWhen.join("; ")}\n- **Official Resource:** [${f.officialResource.title}](${f.officialResource.url})`
        )
        .join("\n\n")
    : "";

  const productMapMarkdown = blueprint.productMap
    ? `## Product Definition & Architecture Map
- **What it does:** ${blueprint.productMap.whatItDoes}
- **MVP Data Storage:** ${blueprint.productMap.dataItNeeds.storageForMvp} (Later: ${blueprint.productMap.dataItNeeds.laterOptions})

### User Journey
${blueprint.productMap.userJourney.map((j, i) => `${i + 1}. ${j}`).join("\n")}

### Parts You Need NOW vs Parts to IGNORE For Now
- **Needed Now:** ${blueprint.productMap.partsYouNeedNow.map((p) => `${p.part} (${p.reason})`).join("; ")}
- **Ignore for Now (No Cloud DB/Auth bloat in MVP):** ${blueprint.productMap.partsYouCanIgnoreForNow.map((p) => `${p.part} (${p.reason})`).join("; ")}

### MVP Scope Boundaries
- **v1 (Demo-Ready):** ${blueprint.productMap.mvpVsLater.v1DemoReady.join(", ")}
- **v2 (Fast Follow):** ${blueprint.productMap.mvpVsLater.v2Next.join(", ")}
- **v3 (Full Product):** ${blueprint.productMap.mvpVsLater.v3Future.join(", ")}
`
    : "";

  const first20Markdown = blueprint.first20Minutes
    ? `## Start Here: Your First 20 Minutes
- **Action:** ${blueprint.first20Minutes.action}
- **Why:** ${blueprint.first20Minutes.why}
- **What To Do:**\n${blueprint.first20Minutes.whatToDo.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}
- **Done When:** ${blueprint.first20Minutes.whatDoneLooksLike}
`
    : "";

  return `# Project Blueprint: ${blueprint.projectTitle}
> **AI Coding Agent Instruction:** Use this blueprint to build the project step by step with the user. Follow the phases sequentially and execute the immediate next actions first. Explain all choices in plain English and stop after each milestone.

## Executive Summary
${blueprint.summary}

## Strategic Architecture Decision
${blueprint.strategyDecision}

${first20Markdown}

## Foundations Curriculum (Learn First)
${foundationsMarkdown}

${productMapMarkdown}

## Where Beginners Get Stuck (Pitfalls & Traps)
${pitfallsMarkdown}

## Phased Milestones (Capped <= 3 files, <= 90m)
${roadmapMarkdown}

## Immediate Next Actions
${actionsMarkdown}

## Recommended Tech Stack
${stackMarkdown}

## Free Learning Resources
${resourcesMarkdown}

## AI Coding Agent Workflow Guide
${tipsMarkdown}

### First Prompt to Send to Your Coding Agent
\`\`\`
${blueprint.agentGuide.firstPrompt}
\`\`\`
`;
}
