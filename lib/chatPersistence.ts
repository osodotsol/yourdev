import { ChatMessage } from "@/types/chat";
import { redactSensitive } from "@/lib/redact";

const CHAT_STORAGE_KEY = "yourdev_chat_history_v1";
const MAX_MESSAGES_PER_PROJECT = 20;
const MAX_PROJECTS_STORED = 6;

interface StoredChatRegistry {
  projects: Record<string, ChatMessage[]>;
  lastUpdated: Record<string, number>;
}

export function normalizeProjectId(rawId?: string): string {
  if (!rawId || typeof rawId !== "string") {
    return "default-project";
  }
  return rawId
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "default-project";
}

function getStoredRegistry(): StoredChatRegistry {
  if (typeof window === "undefined") {
    return { projects: {}, lastUpdated: {} };
  }
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return { projects: {}, lastUpdated: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.projects) {
      return { projects: {}, lastUpdated: {} };
    }
    return {
      projects: parsed.projects || {},
      lastUpdated: parsed.lastUpdated || {},
    };
  } catch (err) {
    console.warn("[ChatStorage] Failed to read stored chat history:", err);
    return { projects: {}, lastUpdated: {} };
  }
}

function setStoredRegistry(registry: StoredChatRegistry): void {
  if (typeof window === "undefined") return;
  try {
    // Evict oldest projects if exceeding maximum project count
    const projectKeys = Object.keys(registry.projects);
    if (projectKeys.length > MAX_PROJECTS_STORED) {
      projectKeys.sort(
        (a, b) => (registry.lastUpdated[a] || 0) - (registry.lastUpdated[b] || 0)
      );
      while (projectKeys.length > MAX_PROJECTS_STORED) {
        const oldest = projectKeys.shift();
        if (oldest) {
          delete registry.projects[oldest];
          delete registry.lastUpdated[oldest];
        }
      }
    }

    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(registry));
  } catch (err) {
    console.warn("[ChatStorage] Failed to save chat history:", err);
  }
}

/**
 * Loads persisted chat messages for a specific project.
 */
export function loadChatMessages(projectId: string): ChatMessage[] {
  const normId = normalizeProjectId(projectId);
  const registry = getStoredRegistry();
  const messages = registry.projects[normId];
  if (!Array.isArray(messages)) {
    return [];
  }
  return messages.slice(-MAX_MESSAGES_PER_PROJECT);
}

/**
 * Saves chat messages for a specific project, redacting sensitive credentials and capping history length.
 */
export function saveChatMessages(projectId: string, messages: ChatMessage[]): void {
  const normId = normalizeProjectId(projectId);
  const registry = getStoredRegistry();

  // Bounded and sanitized messages
  const sanitized: ChatMessage[] = (messages || [])
    .slice(-MAX_MESSAGES_PER_PROJECT)
    .map((msg) => ({
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: msg.role === "mentor" ? "mentor" : "user",
      content: redactSensitive(msg.content || "").slice(0, 3000),
      timestamp: typeof msg.timestamp === "number" ? msg.timestamp : Date.now(),
      isOffline: Boolean(msg.isOffline),
    }));

  registry.projects[normId] = sanitized;
  registry.lastUpdated[normId] = Date.now();

  setStoredRegistry(registry);
}

/**
 * Clears chat history for a specific project.
 */
export function clearChatMessages(projectId: string): void {
  const normId = normalizeProjectId(projectId);
  const registry = getStoredRegistry();
  delete registry.projects[normId];
  delete registry.lastUpdated[normId];
  setStoredRegistry(registry);
}
