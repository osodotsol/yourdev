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

  const tipsMarkdown = blueprint.agentGuide.workflowTips
    .map((t) => `- ${t}`)
    .join("\n");

  return `# Project Blueprint: ${blueprint.projectTitle}
> **AI Coding Agent Instruction:** Use this blueprint to build the project step by step with the user. Follow the phases sequentially and execute the immediate next actions first. Do not skip testing each step.

## Executive Summary
${blueprint.summary}

## Strategic Architecture Decision
${blueprint.strategyDecision}

## Where Beginners Get Stuck (Pitfalls & Traps)
${pitfallsMarkdown}

## 1. Phased Roadmap
${roadmapMarkdown}

## 2. Immediate Next Actions
${actionsMarkdown}

## 3. Recommended Tech Stack
${stackMarkdown}

## 4. Free Learning Resources
${resourcesMarkdown}

## 5. AI Coding Agent Workflow Guide
${tipsMarkdown}

### First Prompt to Send to Your Coding Agent
\`\`\`
${blueprint.agentGuide.firstPrompt}
\`\`\`
`;
}
