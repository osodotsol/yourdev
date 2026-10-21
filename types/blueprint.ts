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

export interface PitfallItem {
  trap: string;
  whyItHappens: string;
  howToAvoid: string;
}

export interface AgentGuide {
  workflowTips: string[];
  firstPrompt: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  recommendation?: boolean;
}

export interface ClarifyingQuestion {
  id: string;
  title: string;
  helper: string;
  options: QuestionOption[];
}

export interface IdeaBlueprint {
  projectTitle: string;
  summary: string;
  strategyDecision: string;
  pitfalls: PitfallItem[];
  roadmap: BlueprintPhase[];
  nextActions: NextAction[];
  techStack: StackItem[];
  resources: ResourceItem[];
  agentGuide: AgentGuide;
  isFallback?: boolean;
  userChoices?: Record<string, string>;
}
