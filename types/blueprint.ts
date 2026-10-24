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
  isChecked?: boolean;
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

export interface FoundationModule {
  id: string;
  title: string;
  plainEnglishSummary: string;
  minutes: number;
  tier: "core" | "deeper" | "later";
  prerequisites: string[];
  officialResource: { title: string; url: string };
  youreDoneWhen: string[];
  vibeMinimumNote: string;
  deeperNote: string;
  whyNeededForProject?: string;
}

export interface First20Minutes {
  action: string;
  why: string;
  whatToDo: string[];
  whatDoneLooksLike: string;
  starterTerminalCommand?: string;
}

export interface ProductMap {
  whatItDoes: string;
  userJourney: string[];
  screens: Array<{ name: string; userAction: string }>;
  dataItNeeds: {
    description: string;
    storageForMvp: string;
    laterOptions: string;
  };
  partsYouNeedNow: Array<{ part: string; reason: string }>;
  partsYouCanIgnoreForNow: Array<{ part: string; reason: string }>;
  mvpVsLater: {
    v1DemoReady: string[];
    v2Next: string[];
    v3Future: string[];
    outOfScopeWithReasons: Array<{ feature: string; reason: string }>;
  };
  nextImplementationSteps: Array<{ step: string; reason: string }>;
}

export interface LearnerProfileAnswers {
  codingStyle: "vibe" | "mix" | "myself";
  experienceLevel: "none" | "beginner" | "intermediate";
  hoursPerDay: number;
  daysAvailable: number;
  customAnswers?: Record<string, string>;
}

export interface StarterArtifact {
  filename: string;
  language: string;
  content: string;
  purpose: string;
}

export interface VerificationCheck {
  id: string;
  label: string;
  passed: boolean;
  message?: string;
}

export interface RoadmapNode {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  badge: "CORE MVP" | "RECOMMENDED" | "POLISH";
  goal: string;
  definitionOfDone: string[];
  conceptToLearn: string;
  estimatedMinutes: number; // max 90 min
  requiredFoundations?: string[];
  filesToCreate: string[]; // max 3 files
  keyPackages?: string[];
  stepPrompt: string;
  resources: { title: string; url: string; isChecked?: boolean }[];
  starterArtifacts?: StarterArtifact[];
}

export interface StepReviewResult {
  stepId: string;
  verdict: "passed" | "needs_work" | "warning";
  verdictLabel: string;
  feedback: string;
  positivePoints: string[];
  suggestedFixes: string[];
  nextTip: string;
  timestamp: number;
  checks?: VerificationCheck[];
  artifactFilename?: string;
  contentHash?: string;
}

export type ProjectType =
  | "web app"
  | "mobile app"
  | "bot"
  | "CLI"
  | "data/script"
  | "game"
  | "other";

export type ProjectSide =
  | "front end (what the user sees)"
  | "back end (works behind the scenes)"
  | "both";

export interface StackAlternative {
  name: string;
  pick_this_if: string;
}

export interface RecommendedStack {
  language: string;
  framework_or_tools: string[];
  why_in_plain_english: string;
  alternatives: StackAlternative[];
}

export interface PartResource {
  title: string;
  url: string;
  why: string;
}

export interface ProjectPart {
  id: string;
  name: string;
  one_line_purpose: string;
  side: ProjectSide;
  depends_on: string[];
  // Tester requirements
  example_look_feel_function?: string;
  steps?: string[];
  resources?: PartResource[];
}

export interface ProjectArchitecture {
  project_type: ProjectType;
  front_back_explained_simply: string;
  recommended_stack: RecommendedStack;
  parts: ProjectPart[];
  finished_product_preview?: string;
}

export type SectionSource = "model" | "fallback" | "curated";

export interface IdeaBlueprint {
  projectTitle: string;
  summary: string;
  strategyDecision: string;
  architecture: ProjectArchitecture;
  first20Minutes: First20Minutes;
  foundations: {
    selectedModules: FoundationModule[];
    totalEstimatedMinutes: number;
    fitsTimeBudget: boolean;
    timeBudgetNote: string;
    howAnswersShapedPlan: string;
  };
  productMap: ProductMap;
  pitfalls: PitfallItem[];
  roadmap: BlueprintPhase[];
  nextActions: NextAction[];
  techStack: StackItem[];
  resources: ResourceItem[];
  agentGuide: AgentGuide;
  nodes: RoadmapNode[];
  isFallback?: boolean;
  userChoices?: Record<string, string>;
  learnerProfile?: LearnerProfileAnswers;
  reviews?: Record<string, StepReviewResult>;
  sourceBadges?: Record<string, SectionSource>;
}

