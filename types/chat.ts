export interface ChatMessage {
  id: string;
  role: "user" | "mentor";
  content: string;
  timestamp: number;
  isOffline?: boolean;
}

export interface ChatMilestoneContext {
  step: number;
  title: string;
  goal: string;
  filesToCreate?: string[];
  definitionOfDone?: string[];
}

export interface ChatVerificationContext {
  passed: boolean;
  failedChecks?: string[];
  summary?: string;
}

export interface ChatProjectContext {
  projectId: string;
  projectTitle: string;
  projectIdea?: string;
  projectType?: string;
  techStack?: string[];
  activeMilestone?: ChatMilestoneContext;
  recentVerification?: ChatVerificationContext;
  userCodeExcerpt?: string;
  userErrorMessage?: string;
}

export interface ChatRequestBody {
  message: string;
  history?: Array<{ role: "user" | "mentor"; content: string }>;
  context?: ChatProjectContext;
  // Test-only controls (guarded by isTestHookAllowed)
  mockResponse?: string;
  simulateFailure?: boolean;
  mockDelayMs?: number;
  timeoutMs?: number;
}

export interface ChatResponseBody {
  reply: string;
  isOffline: boolean;
  offlineNotice?: string;
  timestamp: number;
}
