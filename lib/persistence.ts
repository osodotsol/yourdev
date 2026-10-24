import { IdeaBlueprint, StepReviewResult } from "@/types/blueprint";
import { sanitizeCompletedNodeIds } from "./milestoneCompletion";

const STORAGE_KEY = "yourdev_session_v1";

export interface StoredSession {
  blueprint: IdeaBlueprint | null;
  rawIdea: string;
  userChoices: Record<string, string>;
  completedNodeIds: string[];
  completedFoundationIds: string[];
  vibeMode: boolean;
  reviews: Record<string, StepReviewResult>;
  artifactReviews?: Record<string, StepReviewResult>;
  artifactDrafts?: Record<string, string>;
  lastUpdated: number;
}

/**
 * Saves current user session safely to localStorage.
 */
export function saveSession(session: Partial<StoredSession>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSession();
    const merged: StoredSession = {
      blueprint: session.blueprint !== undefined ? session.blueprint : existing.blueprint,
      rawIdea: session.rawIdea !== undefined ? session.rawIdea : existing.rawIdea,
      userChoices: session.userChoices !== undefined ? session.userChoices : existing.userChoices,
      completedNodeIds: session.completedNodeIds !== undefined ? session.completedNodeIds : existing.completedNodeIds,
      completedFoundationIds: session.completedFoundationIds !== undefined ? session.completedFoundationIds : existing.completedFoundationIds,
      vibeMode: session.vibeMode !== undefined ? session.vibeMode : existing.vibeMode,
      reviews: session.reviews !== undefined ? session.reviews : existing.reviews,
      artifactReviews: session.artifactReviews !== undefined ? session.artifactReviews : existing.artifactReviews,
      artifactDrafts: session.artifactDrafts !== undefined ? session.artifactDrafts : existing.artifactDrafts,
      lastUpdated: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn("[Storage] Failed to save session:", err);
  }
}

/**
 * Loads persisted session from localStorage.
 */
export function loadSession(): StoredSession {
  const defaultSession: StoredSession = {
    blueprint: null,
    rawIdea: "",
    userChoices: {},
    completedNodeIds: [],
    completedFoundationIds: [],
    vibeMode: true,
    reviews: {},
    artifactReviews: {},
    artifactDrafts: {},
    lastUpdated: 0,
  };

  if (typeof window === "undefined") return defaultSession;

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultSession;
    const parsed = JSON.parse(data);

    const rawCompletedNodeIds = Array.isArray(parsed.completedNodeIds) ? parsed.completedNodeIds : [];
    const blueprint: IdeaBlueprint | null = parsed.blueprint || null;
    const artifactReviews: Record<string, StepReviewResult> = parsed.artifactReviews || {};
    const artifactDrafts: Record<string, string> = parsed.artifactDrafts || {};

    const nodes = blueprint?.nodes || [];
    const sanitizedCompletedNodeIds = nodes.length > 0
      ? sanitizeCompletedNodeIds(rawCompletedNodeIds, nodes, artifactReviews, artifactDrafts)
      : rawCompletedNodeIds;

    if (sanitizedCompletedNodeIds.length !== rawCompletedNodeIds.length) {
      try {
        parsed.completedNodeIds = sanitizedCompletedNodeIds;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
    }

    return {
      blueprint,
      rawIdea: parsed.rawIdea || "",
      userChoices: parsed.userChoices || {},
      completedNodeIds: sanitizedCompletedNodeIds,
      completedFoundationIds: Array.isArray(parsed.completedFoundationIds) ? parsed.completedFoundationIds : [],
      vibeMode: typeof parsed.vibeMode === "boolean" ? parsed.vibeMode : true,
      reviews: parsed.reviews || {},
      artifactReviews,
      artifactDrafts,
      lastUpdated: parsed.lastUpdated || 0,
    };
  } catch (err) {
    console.warn("[Storage] Failed to load session:", err);
    return defaultSession;
  }
}

/**
 * Clears saved session from localStorage.
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[Storage] Failed to clear session:", err);
  }
}
