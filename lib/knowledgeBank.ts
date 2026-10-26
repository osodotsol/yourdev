import { RoadmapNode, PitfallItem } from "@/types/blueprint";
import { createExtensionStarterArtifacts } from "@/lib/artifactVerifier";

export interface SkillModule {
  id: string;
  name: string;
  category: "Framework" | "Platform" | "Data & Storage" | "Pattern";
  summary: string;
  architectureRules: string[];
  recommendedPackages: string[];
  standardNodes: {
    step: number;
    title: string;
    subtitle: string;
    badge: "CORE MVP" | "RECOMMENDED" | "POLISH";
    goal: string;
    filesToCreate: string[];
    promptSnippet: string;
  }[];
  pitfalls: PitfallItem[];
  docs: { title: string; url: string }[];
}

export const KNOWLEDGE_BANK: Record<string, SkillModule> = {
  nextjs_app_router: {
    id: "nextjs_app_router",
    name: "Next.js 15 App Router & React Server Components",
    category: "Framework",
    summary: "Production standard full-stack React framework with server/client component boundaries, file-based routing, and built-in API handlers.",
    architectureRules: [
      "Keep pages default Server Components unless interactivity (useState/useEffect) is strictly needed; mark interactive files with 'use client'.",
      "Colocate shared TypeScript types in a top-level types/ directory rather than inside component files.",
      "Never mix server-side secrets or API keys into client components.",
      "Use browser localStorage for zero-database MVP persistence before configuring cloud databases.",
    ],
    recommendedPackages: ["next", "react", "react-dom", "lucide-react", "tailwind-merge"],
    standardNodes: [
      {
        step: 1,
        title: "Data Contracts & Type Schema",
        subtitle: "Scaffold interfaces and domain boundary",
        badge: "CORE MVP",
        goal: "Define strict TypeScript interfaces for all primary entities before writing UI code.",
        filesToCreate: ["types/index.ts", "types/schema.ts"],
        promptSnippet: "Create clean TypeScript interfaces for the primary entities with zero external dependencies.",
      },
      {
        step: 2,
        title: "Core Feature View & State Loop",
        subtitle: "Primary interactive screen",
        badge: "CORE MVP",
        goal: "Build the central interactive view with tactile controls and optimistic state updates.",
        filesToCreate: ["components/MainView.tsx", "components/InputForm.tsx"],
        promptSnippet: "Build the primary interactive view using Tailwind CSS with tactile hover feedback and state handling.",
      },
      {
        step: 3,
        title: "Persistence & Offline Reliability",
        subtitle: "Zero-database browser storage",
        badge: "RECOMMENDED",
        goal: "Synchronize local state with localStorage so refreshing the page maintains 100% of the session.",
        filesToCreate: ["lib/storage.ts", "hooks/useLocalStorage.ts"],
        promptSnippet: "Implement a safe localStorage wrapper with error boundaries to persist state across browser reloads.",
      },
      {
        step: 4,
        title: "Demo Day Polish & Edge Cases",
        subtitle: "Empty states and toast feedback",
        badge: "POLISH",
        goal: "Add smooth loading shimmers, accessible empty states, and toast confirmation alerts.",
        filesToCreate: ["components/Toast.tsx", "components/Skeleton.tsx"],
        promptSnippet: "Add micro-interactions, empty states, and a clean reset flow ready for a 2-minute video recording.",
      },
    ],
    pitfalls: [
      {
        trap: "Premature cloud database configuration stalling Day 1 progress",
        whyItHappens: "Spending the first 8 hours setting up Supabase, Prisma, and Auth before validating if the core loop is fun.",
        howToAvoid: "Build Phase 1 entirely with localStorage. A zero-auth, zero-latency prototype lets anyone test instantly.",
      },
      {
        trap: "Client/Server Component hydration mismatch",
        whyItHappens: "Accessing browser-only APIs (`window`, `localStorage`, `navigator`) during server-side initial render.",
        howToAvoid: "Wrap client storage reads inside `useEffect` or check `typeof window !== 'undefined'` before reading.",
      },
    ],
    docs: [
      { title: "Next.js App Router Official Docs", url: "https://nextjs.org/docs" },
      { title: "Tailwind CSS Utility Reference", url: "https://tailwindcss.com/docs" },
    ],
  },

  chrome_mv3_extension: {
    id: "chrome_mv3_extension",
    name: "Chrome Extension Manifest V3",
    category: "Platform",
    summary: "Modern browser extension architecture utilizing background service workers, activeTab permissions, and isolated content scripts.",
    architectureRules: [
      "Use Chrome Manifest V3 service workers instead of deprecated V2 persistent background pages.",
      "Rely on 'activeTab' permission to avoid aggressive browser security warning dialogs on install.",
      "Never attempt to access page DOM directly from the service worker; communicate via chrome.tabs.sendMessage.",
      "Use chrome.storage.local for asynchronous, quota-friendly local data persistence.",
    ],
    recommendedPackages: ["typescript", "vite"],
    standardNodes: [
      {
        step: 1,
        title: "Manifest V3 Skeleton & Popup View",
        subtitle: "Basic extension entrypoint",
        badge: "CORE MVP",
        goal: "Configure manifest.json, action icons, popup HTML, and verify local unpacked extension loading in chrome://extensions.",
        filesToCreate: ["manifest.json", "popup.html", "src/popup.ts"],
        promptSnippet: "Create a minimal Manifest V3 manifest.json with activeTab permission and a 360x480px popup UI.",
      },
      {
        step: 2,
        title: "Content Script & Page DOM Scraper",
        subtitle: "In-page DOM reader",
        badge: "CORE MVP",
        goal: "Inject content script to extract target data from the active browser tab and send structured messages to popup.",
        filesToCreate: ["src/content.ts", "types/messages.ts"],
        promptSnippet: "Write a resilient content script that extracts target page text and listens for popup queries via message passing.",
      },
      {
        step: 3,
        title: "Storage Engine & Data Management",
        subtitle: "chrome.storage.local persistence",
        badge: "RECOMMENDED",
        goal: "Save extracted records into chrome.storage.local with search, filter, and delete actions in popup.",
        filesToCreate: ["src/storage.ts", "components/RecordList.ts"],
        promptSnippet: "Implement chrome.storage.local helper methods with error checking and export to JSON/CSV.",
      },
      {
        step: 4,
        title: "Keyboard Shortcuts & Production Pack",
        subtitle: "Hotkeys and Chrome Web Store zip",
        badge: "POLISH",
        goal: "Add hotkey command activation and build a clean, production-ready .zip package.",
        filesToCreate: ["package.json", "scripts/bundle.js"],
        promptSnippet: "Configure keyboard command shortcuts in manifest.json and write an automated zip bundling script.",
      },
    ],
    pitfalls: [
      {
        trap: "Using deprecated Manifest V2 background page patterns",
        whyItHappens: "AI models referencing outdated 2020 tutorials with window/document in background scripts.",
        howToAvoid: "Explicitly declare 'service_worker' in manifest.json background field and use event listeners.",
      },
      {
        trap: "Requesting broad host permissions (<all_urls>)",
        whyItHappens: "Attempting to query all pages instead of scoping to activeTab on user action.",
        howToAvoid: "Use `activeTab` permission so users are not terrified by browser warning dialogs.",
      },
    ],
    docs: [
      { title: "Chrome Manifest V3 Migration Guide", url: "https://developer.chrome.com/docs/extensions/mv3/" },
      { title: "Chrome Storage API Reference", url: "https://developer.chrome.com/docs/extensions/reference/storage/" },
    ],
  },

  react_native_expo: {
    id: "react_native_expo",
    name: "React Native & Expo Managed Workflow",
    category: "Platform",
    summary: "Cross-platform mobile development using Expo Go for instant physical phone testing without native Xcode/Android build tools.",
    architectureRules: [
      "Use only React Native UI primitives (<View>, <Text>, <Pressable>), never web HTML tags (<div>, <span>).",
      "Stay strictly within the Expo managed workflow (install via `npx expo install`) to avoid native code failures.",
      "Use @react-native-async-storage/async-storage for offline key-value storage.",
      "Wrap scrollable data in FlatList rather than ScrollView for high performance.",
    ],
    recommendedPackages: ["expo", "react-native", "expo-router", "nativewind", "@react-native-async-storage/async-storage"],
    standardNodes: [
      {
        step: 1,
        title: "Expo Scaffold & Tab Navigation",
        subtitle: "Native screen layout",
        badge: "CORE MVP",
        goal: "Initialize Expo TypeScript template with safe area views and clean screen navigation.",
        filesToCreate: ["app/_layout.tsx", "app/index.tsx", "types/mobile.ts"],
        promptSnippet: "Create an Expo Router layout with SafeAreaView and native typography primitives.",
      },
      {
        step: 2,
        title: "Touch-First Interaction Form",
        subtitle: "Native inputs & FlatList",
        badge: "CORE MVP",
        goal: "Build touch-friendly cards with swipe/tap actions and smooth list rendering.",
        filesToCreate: ["components/ItemCard.tsx", "components/AddModal.tsx"],
        promptSnippet: "Build a touch-friendly React Native card component using FlatList and Pressable with haptic feedback.",
      },
      {
        step: 3,
        title: "AsyncStorage & Offline Sync",
        subtitle: "Device persistence",
        badge: "RECOMMENDED",
        goal: "Persist items with AsyncStorage and handle pull-to-refresh state.",
        filesToCreate: ["lib/asyncStorage.ts"],
        promptSnippet: "Create safe AsyncStorage wrapper functions with JSON parsing try/catch guards.",
      },
      {
        step: 4,
        title: "Haptic Feedback & Mobile Polish",
        subtitle: "Device vibrations and Expo Go demo",
        badge: "POLISH",
        goal: "Add expo-haptics on action triggers and prepare for live phone demo via Expo Go QR code.",
        filesToCreate: ["app.json", "components/HapticButton.tsx"],
        promptSnippet: "Integrate expo-haptics on button presses and verify smooth performance on mobile.",
      },
    ],
    pitfalls: [
      {
        trap: "Accidentally using web HTML tags causing red-screen crashes",
        whyItHappens: "AI coding agents defaulting to web React syntax like <div> instead of <View>.",
        howToAvoid: "Strictly enforce React Native primitives in all prompts (<View>, <Text>, <Pressable>).",
      },
      {
        trap: "Keyboard covering input fields on mobile",
        whyItHappens: "Missing KeyboardAvoidingView wrapper on input screens.",
        howToAvoid: "Wrap all mobile input screens with `KeyboardAvoidingView`.",
      },
    ],
    docs: [
      { title: "Expo Documentation & Quickstart", url: "https://docs.expo.dev/" },
      { title: "React Native Core Components", url: "https://reactnative.dev/docs/components-and-apis" },
    ],
  },

  cheerio_scraper: {
    id: "cheerio_scraper",
    name: "Web Scraping & Data Pipeline (Cheerio & SQLite)",
    category: "Pattern",
    summary: "Fast, resilient HTML parsing and deduplication pipeline extracting clean structured records with zero IP bans.",
    architectureRules: [
      "Always save an offline sample HTML fixture in scripts/fixtures/ to develop selectors without hitting external servers.",
      "Generate SHA256 content hashes (e.g. hash of URL + title) to immediately skip duplicate records.",
      "Add polite request headers (User-Agent, rate-limiting delays) to respect target sites.",
      "Store extracted records in a single-file SQLite database (or local JSON) for instant zero-config demos.",
    ],
    recommendedPackages: ["cheerio", "better-sqlite3", "node-fetch"],
    standardNodes: [
      {
        step: 1,
        title: "HTML Parser & Fixture Extraction",
        subtitle: "Offline selector development",
        badge: "CORE MVP",
        goal: "Write standalone fetch and parse script against a saved HTML fixture and verify zero undefined outputs.",
        filesToCreate: ["scripts/scrape.ts", "scripts/fixtures/sample.html", "types/scraper.ts"],
        promptSnippet: "Write a Cheerio scraping function that reads a saved HTML file and extracts clean structured items.",
      },
      {
        step: 2,
        title: "Hash Deduplication & SQLite Store",
        subtitle: "Data normalization pipeline",
        badge: "CORE MVP",
        goal: "Create SQLite table schema and upsert items using unique content hashes to prevent duplicates.",
        filesToCreate: ["lib/db.ts", "lib/hasher.ts"],
        promptSnippet: "Implement SHA256 hashing on item URLs and upsert records into SQLite with better-sqlite3.",
      },
      {
        step: 3,
        title: "Filterable Web Dashboard",
        subtitle: "Search, filter, and digest UI",
        badge: "RECOMMENDED",
        goal: "Build Next.js Route Handler and interactive dashboard to search, sort, and filter collected data.",
        filesToCreate: ["app/api/items/route.ts", "components/DigestGrid.tsx"],
        promptSnippet: "Build a clean filterable dashboard showing collected records with instantaneous search.",
      },
      {
        step: 4,
        title: "Manual Refresh & CSV Export",
        subtitle: "On-demand execution & export",
        badge: "POLISH",
        goal: "Add an on-demand 'Refresh Now' trigger with progress indicators and one-click CSV file download.",
        filesToCreate: ["components/ExportButton.tsx", "lib/csv.ts"],
        promptSnippet: "Add CSV export formatting and an on-demand scraping trigger with loading state.",
      },
    ],
    pitfalls: [
      {
        trap: "Selector drift or IP rate-limiting breaking live demo presentation",
        whyItHappens: "Depending on live external web requests during a recorded demo or live presentation.",
        howToAvoid: "Save an offline sample fixture so the demo works 100% reliably even if Wi-Fi drops.",
      },
      {
        trap: "Unsanitized HTML breaking component rendering",
        whyItHappens: "Directly rendering scraped strings without stripping raw HTML entities.",
        howToAvoid: "Sanitize text through Cheerio `.text().trim()` before saving into state.",
      },
    ],
    docs: [
      { title: "Cheerio HTML Selector Guide", url: "https://cheerio.js.org/" },
      { title: "SQLite Documentation", url: "https://sqlite.org/docs.html" },
    ],
  },
};

/**
 * Retrieve matching knowledge bank modules for an idea text and choices.
 */
export function retrieveKnowledge(ideaText: string, choices: Record<string, string> = {}): SkillModule[] {
  const lower = ideaText.toLowerCase();
  const matched: SkillModule[] = [];

  if (lower.includes("extension") || lower.includes("chrome") || lower.includes("plugin")) {
    matched.push(KNOWLEDGE_BANK.chrome_mv3_extension);
  }

  if (lower.includes("mobile") || lower.includes("ios") || lower.includes("android") || lower.includes("react native") || lower.includes("expo")) {
    matched.push(KNOWLEDGE_BANK.react_native_expo);
  }

  if (lower.includes("scrape") || lower.includes("scraper") || lower.includes("crawler") || lower.includes("meetup") || lower.includes("event")) {
    matched.push(KNOWLEDGE_BANK.cheerio_scraper);
  }

  // Always include modern web fullstack foundation
  matched.push(KNOWLEDGE_BANK.nextjs_app_router);

  return matched;
}

/**
 * Convert knowledge bank standard nodes into tailored RoadmapNode array.
 */
export function buildRoadmapNodes(
  skill: SkillModule,
  projectTitle: string,
  summary: string
): RoadmapNode[] {
  return skill.standardNodes.map((node) => ({
    id: `node-${node.step}`,
    step: node.step,
    title: node.title,
    subtitle: node.subtitle,
    badge: node.badge,
    goal: node.goal,
    filesToCreate: node.filesToCreate.slice(0, 3),
    keyPackages: skill.recommendedPackages.slice(0, 3),
    definitionOfDone: [
      `All target files exist and compile without syntax errors.`,
      `The core action in "${node.title}" executes as intended.`,
    ],
    conceptToLearn: `Core architectural boundaries and file separation for ${node.subtitle.toLowerCase()}.`,
    estimatedMinutes: Math.min(45 + node.step * 15, 90),
    requiredFoundations: [`foundation-${Math.min(node.step, 6)}`],
    stepPrompt: `I am building ${projectTitle}.
PROJECT GOAL: ${summary}

We are executing Step ${node.step}: ${node.title} (${node.subtitle}).

GOAL:
${node.goal}

TARGET FILES TO CREATE/EDIT (Max 3):
${node.filesToCreate.slice(0, 3).map((f) => `- ${f}`).join("\n")}

INSTRUCTIONS:
${node.promptSnippet}

RULES FOR THIS STEP:
1. Explain your technical choices in plain language without jargon.
2. Keep edits scoped strictly to the target files above. Write complete code with no placeholders.
3. STOP after completing this step so I can verify and test it before proceeding.`,
    resources: skill.docs,
    starterArtifacts:
      skill.id === "chrome_extension_mv3" && node.step === 1
        ? createExtensionStarterArtifacts(projectTitle)
        : undefined,
  }));
}
