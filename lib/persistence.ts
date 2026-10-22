import { IdeaBlueprint, StepReviewResult } from "@/types/blueprint";

const STORAGE_KEY = "yourdev_session_v1";

export interface StoredSession {
  blueprint: IdeaBlueprint | null;
  rawIdea: string;
  userChoices: Record<string, string>;
  completedNodeIds: string[];
  reviews: Record<string, StepReviewResult>;
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
      reviews: session.reviews !== undefined ? session.reviews : existing.reviews,
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
    reviews: {},
    lastUpdated: 0,
  };

  if (typeof window === "undefined") return defaultSession;

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultSession;
    const parsed = JSON.parse(data);
    return {
      blueprint: parsed.blueprint || null,
      rawIdea: parsed.rawIdea || "",
      userChoices: parsed.userChoices || {},
      completedNodeIds: Array.isArray(parsed.completedNodeIds) ? parsed.completedNodeIds : [],
      reviews: parsed.reviews || {},
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
