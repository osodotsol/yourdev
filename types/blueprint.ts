export interface BlueprintPhase {
  phase: string;
  title: string;
  description: string;
}

export interface NextAction {
  step: number;
  action: string;
  detail: string;
}

export interface StackItem {
  category: string;
  name: string;
  reason: string;
}

export interface ResourceItem {
  type: string;
  title: string;
  url: string;
}

export interface AgentGuide {
  workflowTips: string[];
  firstPrompt: string;
}

export interface IdeaBlueprint {
  projectTitle: string;
  summary: string;
  roadmap: BlueprintPhase[];
  nextActions: NextAction[];
  techStack: StackItem[];
  resources: ResourceItem[];
  agentGuide: AgentGuide;
  isFallback?: boolean;
}
