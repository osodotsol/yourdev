import {
  IdeaBlueprint,
  BlueprintPhase,
  NextAction,
  StackItem,
  ResourceItem,
  PitfallItem,
  ClarifyingQuestion,
  RoadmapNode,
} from "@/types/blueprint";
import { retrieveKnowledge, buildRoadmapNodes } from "@/lib/knowledgeBank";

export type ProjectCategory =
  | "extension"
  | "mobile"
  | "scraper"
  | "bot"
  | "cli"
  | "flashcards"
  | "finance"
  | "habit"
  | "ai_tool"
  | "ecommerce"
  | "general_web";

export function detectCategory(text: string): ProjectCategory {
  const lower = text.toLowerCase();

  if (
    lower.includes("extension") ||
    lower.includes("chrome") ||
    lower.includes("browser add-on") ||
    lower.includes("browser plugin")
  ) {
    return "extension";
  }

  if (
    lower.includes("mobile") ||
    lower.includes("ios") ||
    lower.includes("android") ||
    lower.includes("react native") ||
    lower.includes("expo") ||
    lower.includes("flutter") ||
    lower.includes("phone app")
  ) {
    return "mobile";
  }

  if (
    lower.includes("scrape") ||
    lower.includes("scraper") ||
    lower.includes("crawler") ||
    lower.includes("crawl") ||
    lower.includes("meetup") ||
    lower.includes("event") ||
    lower.includes("gather")
  ) {
    return "scraper";
  }

  if (
    lower.includes("discord") ||
    lower.includes("telegram") ||
    lower.includes("slack bot") ||
    lower.includes("chatbot") ||
    lower.includes("twitter bot")
  ) {
    return "bot";
  }

  if (
    lower.includes("cli") ||
    lower.includes("command line") ||
    lower.includes("terminal") ||
    lower.includes("console tool") ||
    lower.includes("bash") ||
    lower.includes("npm package")
  ) {
    return "cli";
  }

  if (
    lower.includes("flashcard") ||
    lower.includes("spaced repetition") ||
    lower.includes("leitner") ||
    lower.includes("memorize") ||
    lower.includes("quiz") ||
    lower.includes("study")
  ) {
    return "flashcards";
  }

  if (
    lower.includes("expense") ||
    lower.includes("budget") ||
    lower.includes("finance") ||
    lower.includes("receipt") ||
    lower.includes("money") ||
    lower.includes("wallet") ||
    lower.includes("invoice")
  ) {
    return "finance";
  }

  if (
    lower.includes("habit") ||
    lower.includes("streak") ||
    lower.includes("routine") ||
    lower.includes("pomodoro") ||
    lower.includes("workout tracker")
  ) {
    return "habit";
  }

  if (
    lower.includes("ai ") ||
    lower.includes("summariz") ||
    lower.includes("assistant") ||
    lower.includes("llm") ||
    lower.includes("gpt") ||
    lower.includes("gemini") ||
    lower.includes("transcribe")
  ) {
    return "ai_tool";
  }

  if (
    lower.includes("ecommerce") ||
    lower.includes("store") ||
    lower.includes("shop") ||
    lower.includes("cart") ||
    lower.includes("checkout")
  ) {
    return "ecommerce";
  }

  return "general_web";
}

/**
 * Return 2-3 tailored architectural questions to sharpen the project strategy.
 */
export function getClarifyingQuestions(ideaText: string): ClarifyingQuestion[] {
  const category = detectCategory(ideaText);

  switch (category) {
    case "scraper":
      return [
        {
          id: "data_source",
          title: "What is the primary target page structure?",
          helper: "Determines whether you need a lightweight HTML parser or a full headless browser.",
          options: [
            {
              id: "static_html",
              label: "Static HTML pages (Cheerio / Fast & Lightweight)",
              recommendation: true,
            },
            {
              id: "dynamic_js",
              label: "Dynamic JavaScript-rendered single-page app (Playwright)",
            },
            {
              id: "public_api",
              label: "Semi-public JSON endpoints or RSS feeds",
            },
          ],
        },
        {
          id: "storage_mode",
          title: "Where should collected records be persisted?",
          helper: "Balances instant demo reliability against persistent multi-user storage.",
          options: [
            {
              id: "sqlite_local",
              label: "Zero-setup SQLite / Local JSON file (Guaranteed demo)",
              recommendation: true,
            },
            {
              id: "supabase_cloud",
              label: "Cloud PostgreSQL (Supabase / Neon)",
            },
          ],
        },
        {
          id: "trigger_mode",
          title: "How should the scraper be executed?",
          helper: "Prevents unintended rate limits during local testing.",
          options: [
            {
              id: "manual_button",
              label: "On-demand 'Fetch & Refresh Now' button in the UI",
              recommendation: true,
            },
            {
              id: "cron_schedule",
              label: "Automated recurring background cron job",
            },
          ],
        },
      ];

    case "extension":
      return [
        {
          id: "interaction_style",
          title: "How will users interact with the extension?",
          helper: "Defines the core Chrome Manifest entrypoint.",
          options: [
            {
              id: "popup_window",
              label: "Toolbar icon click opens clean popup window (360x480px)",
              recommendation: true,
            },
            {
              id: "floating_overlay",
              label: "Injected floating badge/sidebar directly inside web pages",
            },
            {
              id: "right_click",
              label: "Right-click context menu action on selected text",
            },
          ],
        },
        {
          id: "data_persistence",
          title: "How should user data and settings be preserved?",
          helper: "Avoids permission warnings on extension install.",
          options: [
            {
              id: "chrome_storage",
              label: "chrome.storage.local (100% offline, zero server required)",
              recommendation: true,
            },
            {
              id: "sync_storage",
              label: "chrome.storage.sync (syncs automatically across Google accounts)",
            },
          ],
        },
      ];

    case "mobile":
      return [
        {
          id: "preview_workflow",
          title: "How will you demo and test the application?",
          helper: "Prevents getting stalled by native Xcode or Android SDK build tools.",
          options: [
            {
              id: "expo_go",
              label: "Expo Go app on physical phone via QR code scan",
              recommendation: true,
            },
            {
              id: "web_simulator",
              label: "Local browser view with React Native Web responsive frame",
            },
          ],
        },
        {
          id: "offline_priority",
          title: "What is the network dependency for Phase 1?",
          helper: "Keeps the proof of concept resilient during presentations.",
          options: [
            {
              id: "offline_first",
              label: "100% offline-first with device AsyncStorage",
              recommendation: true,
            },
            {
              id: "rest_api",
              label: "Live REST API / Cloud backend integration",
            },
          ],
        },
      ];

    case "habit":
      return [
        {
          id: "streak_policy",
          title: "How should habit momentum & streaks be calculated?",
          helper: "A critical UX decision: punitive vs adaptive tracking.",
          options: [
            {
              id: "adaptive_momentum",
              label: "Adaptive pacing (leniency buffer for missed days, no punitive resets)",
              recommendation: true,
            },
            {
              id: "strict_daily",
              label: "Strict daily streaks (resets to 0 if missed by midnight)",
            },
          ],
        },
        {
          id: "storage_scope",
          title: "What storage strategy fits your proof of concept?",
          helper: "Ensures testers can try it instantly with zero sign-up friction.",
          options: [
            {
              id: "local_storage",
              label: "Browser LocalStorage (Zero login, instant tactile demo)",
              recommendation: true,
            },
            {
              id: "account_auth",
              label: "User accounts & cloud synchronization",
            },
          ],
        },
      ];

    case "flashcards":
      return [
        {
          id: "scheduling_system",
          title: "Which spaced repetition model should govern card reviews?",
          helper: "Calibrates the algorithm complexity to a hackathon timeframe.",
          options: [
            {
              id: "leitner_3box",
              label: "3-Box Leitner system (Intuitive, visual, zero setup)",
              recommendation: true,
            },
            {
              id: "sm2_algorithm",
              label: "SuperMemo SM-2 algorithm (ease factors and interval math)",
            },
          ],
        },
        {
          id: "content_source",
          title: "How will test cards be provided to first-time users?",
          helper: "Eliminates empty-state friction during judges' evaluation.",
          options: [
            {
              id: "starter_deck",
              label: "Pre-loaded starter deck (5 curated cards) + custom editor",
              recommendation: true,
            },
            {
              id: "ai_deck_gen",
              label: "AI prompt generates flashcard deck from any topic",
            },
          ],
        },
      ];

    case "finance":
      return [
        {
          id: "privacy_boundary",
          title: "How should sensitive financial transactions be handled?",
          helper: "Crucial for user trust and zero-server security.",
          options: [
            {
              id: "client_only",
              label: "100% Client-side privacy (No financial data touches a server)",
              recommendation: true,
            },
            {
              id: "cloud_db",
              label: "Authenticated cloud database with encrypted fields",
            },
          ],
        },
        {
          id: "input_method",
          title: "Primary method for adding financial entries?",
          helper: "Defines the Phase 1 core interaction loop.",
          options: [
            {
              id: "quick_tap",
              label: "Quick manual tap form with preset category chips ($ / tag / note)",
              recommendation: true,
            },
            {
              id: "csv_import",
              label: "Bank statement CSV file drag-and-drop parser",
            },
          ],
        },
      ];

    case "ai_tool":
      return [
        {
          id: "reliability_strategy",
          title: "What happens if the AI API is rate-limited or offline during a demo?",
          helper: "The #1 hackathon failure mode.",
          options: [
            {
              id: "hybrid_fallback",
              label: "Graceful heuristic smart fallback (Never displays a blank error card)",
              recommendation: true,
            },
            {
              id: "strict_api",
              label: "Strict API-only with visual error toast on network drop",
            },
          ],
        },
        {
          id: "response_rendering",
          title: "How should the AI generated content be presented?",
          helper: "Determines UI component complexity.",
          options: [
            {
              id: "structured_cards",
              label: "Structured categorical cards with 1-click clipboard copy",
              recommendation: true,
            },
            {
              id: "chat_thread",
              label: "Conversational continuous chat stream",
            },
          ],
        },
      ];

    default:
      return [
        {
          id: "storage_scope",
          title: "What is the data persistence strategy for Demo Day?",
          helper: "Avoids burning 50% of your build time configuring cloud auth and databases.",
          options: [
            {
              id: "local_first",
              label: "Zero-database LocalStorage / IndexedDB (Instant review, zero setup)",
              recommendation: true,
            },
            {
              id: "cloud_backend",
              label: "Cloud PostgreSQL / Supabase with user authentication",
            },
          ],
        },
        {
          id: "scope_cutline",
          title: "What is the single make-or-break feature for Phase 1?",
          helper: "Forces a clean MVP boundary before pair-programming with your agent.",
          options: [
            {
              id: "core_loop",
              label: "One flawless user action loop with instant visual feedback",
              recommendation: true,
            },
            {
              id: "multi_feature",
              label: "Multi-page dashboard with reporting and user settings",
            },
          ],
        },
      ];
  }
}

/**
 * Common pitfalls and traps beginners hit for each specific domain.
 */
function getPitfallsForCategory(category: ProjectCategory, userChoices: Record<string, string>): PitfallItem[] {
  switch (category) {
    case "scraper":
      return [
        {
          trap: "Live site selector drift or IP rate-limiting during the presentation",
          whyItHappens: "Relying on live external network requests during a live demo or video recording.",
          howToAvoid: "Save a local HTML fixture in `scripts/fixtures/` and configure a toggle to run against local sample files if the network drops.",
        },
        {
          trap: "Accidental recursive scraping causing memory spikes or bans",
          whyItHappens: "Unbounded link following without domain boundaries or depth limits.",
          howToAvoid: "Hardcode a maximum limit (e.g. `const MAX_ITEMS = 20`) in the parser loop for Phase 1.",
        },
        {
          trap: "Unsanitized HTML breaking React component hydration",
          whyItHappens: "Injecting raw strings containing unescaped HTML entities or script tags.",
          howToAvoid: "Sanitize text through Cheerio (`.text().trim()`) before storing in state; never use `dangerouslySetInnerHTML`.",
        },
      ];

    case "extension":
      return [
        {
          trap: "Using deprecated Manifest V2 patterns (Background pages instead of Service Workers)",
          whyItHappens: "AI agents frequently suggest obsolete 2021 Chrome Extension tutorials.",
          howToAvoid: "Specify explicitly in the agent prompt: 'Use Chrome Manifest V3 service worker syntax and chrome.storage.local'.",
        },
        {
          trap: "Requesting overly broad host permissions (`<all_urls>`)",
          whyItHappens: "Attempting to inspect any page without declaring specific domains.",
          howToAvoid: "Use `activeTab` permission instead of broad host permissions so Chrome never displays a security warning.",
        },
        {
          trap: "Attempting to access window/DOM elements inside the service worker",
          whyItHappens: "Confusing the background script scope with the active page DOM scope.",
          howToAvoid: "Keep DOM queries strictly inside content scripts; use `chrome.runtime.sendMessage` to pass data.",
        },
      ];

    case "mobile":
      return [
        {
          trap: "Accidentally using web HTML tags (`<div>`, `<span>`, `<button>`)",
          whyItHappens: "AI agents defaulting to web React DOM primitives instead of React Native.",
          howToAvoid: "Prompt your agent with: 'Use only React Native primitives (<View>, <Text>, <Pressable>), never web DOM tags'.",
        },
        {
          trap: "Getting stalled in native iOS/Android build configurations",
          whyItHappens: "Ejecting from Expo or installing packages requiring custom Podfile / Gradle changes.",
          howToAvoid: "Stay 100% inside Expo managed workflow (`npx expo install <package>`); use Expo Go on your phone.",
        },
        {
          trap: "Keyboard covering the input fields on smaller phones",
          whyItHappens: "Forgetting to wrap forms with `KeyboardAvoidingView`.",
          howToAvoid: "Wrap all input forms in `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.",
        },
      ];

    case "habit":
      return [
        {
          trap: "Punitive midnight streak resets demoralizing the user",
          whyItHappens: "Naive timestamp comparisons checking exact 24-hour day boundaries.",
          howToAvoid: "Store completion as ISO date strings (`YYYY-MM-DD`) and implement a 1-day grace period before resetting momentum.",
        },
        {
          trap: "Over-complicating persistence with a cloud database before the core loop is fun",
          whyItHappens: "Setting up Supabase, Prisma, and Auth before knowing if the daily checkmark interaction feels tactile.",
          howToAvoid: "Build Phase 1 entirely with `localStorage`. A zero-auth, zero-latency prototype lets anyone test instantly.",
        },
        {
          trap: "Silent state de-synchronization across multiple browser tabs",
          whyItHappens: "Updating localStorage without listening to the `storage` window event.",
          howToAvoid: "Use a centralized custom hook `useHabits()` that reads on mount and syncs state changes.",
        },
      ];

    case "flashcards":
      return [
        {
          trap: "Complex algorithm math distracting from card interaction feel",
          whyItHappens: "Attempting to implement complex SuperMemo SM-2 differential equations in the initial build.",
          howToAvoid: "Start with a clean 3-Box Leitner progression: Box 1 (Daily), Box 2 (Every 3 Days), Box 3 (Mastered).",
        },
        {
          trap: "Empty state upon first load leaves testers with nothing to click",
          whyItHappens: "Expecting judges or testers to manually type in 10 questions before testing.",
          howToAvoid: "Pre-seed the initial state with 5 interesting starter cards so the study session works on second zero.",
        },
        {
          trap: "Card flip animation glitching during fast keyboard tapping",
          whyItHappens: "Applying CSS transitions directly to the container instead of a dedicated inner flipper.",
          howToAvoid: "Use a clean three-layer card structure: outer perspective container, inner 3D flipper, and front/back faces.",
        },
      ];

    case "finance":
      return [
        {
          trap: "JavaScript floating-point arithmetic errors on currency ($0.1 + $0.2 !== $0.3)",
          whyItHappens: "Storing monetary amounts as raw floating-point numbers.",
          howToAvoid: "Store all amounts as integer cents (`amountInCents: 1999`) and divide by 100 only for display formatting.",
        },
        {
          trap: "Demanding bank integration (Plaid) for a weekend proof of concept",
          whyItHappens: "Trying to solve automated transaction sync instead of perfecting the manual entry experience.",
          howToAvoid: "Make manual entry take under 3 seconds with large category chips, or offer a drag-and-drop CSV parser.",
        },
        {
          trap: "Data loss when user clears browser cache without warning",
          whyItHappens: "Relying on localStorage without offering an export mechanism.",
          howToAvoid: "Add a visible 'Export Backup to CSV / JSON' button right below the transaction ledger.",
        },
      ];

    case "ai_tool":
      return [
        {
          trap: "Exposing private API keys in client-side Next.js code",
          whyItHappens: "Using `process.env.GEMINI_API_KEY` directly inside a client component (`'use client'`).",
          howToAvoid: "Always call a server Route Handler (`/api/generate`) that reads server environment variables securely.",
        },
        {
          trap: "Demo hangs on a blank loading screen when API quota runs out",
          whyItHappens: "Failing to set request timeouts and failing to provide an automatic heuristic fallback.",
          howToAvoid: "Set an 8-second timeout on all LLM calls and fall back gracefully to a structured client heuristic.",
        },
        {
          trap: "Hallucinated or invalid JSON breaking the frontend parser",
          whyItHappens: "Expecting the AI to always output 100% valid JSON without markdown fences.",
          howToAvoid: "Strip markdown fences (```json ... ```) and use safe JSON parsing with schema validation before rendering.",
        },
      ];

    default:
      return [
        {
          trap: "Premature optimization: building authentication and databases before validating the core UX",
          whyItHappens: "Spending the first 2 days configuring sign-in, session tokens, and relational migrations.",
          howToAvoid: "Build the complete core feature loop with local state and localStorage first. Add cloud storage only after Phase 1 is verified.",
        },
        {
          trap: "Scope creep causing an unfinished, half-baked project on Demo Day",
          whyItHappens: "Adding secondary features (settings, profiles, notifications) before the core feature is rock-solid.",
          howToAvoid: "Enforce a strict Phase 1 Cutline: one clear problem, one primary action, one satisfying result.",
        },
        {
          trap: "Silent uncaught runtime errors during user testing",
          whyItHappens: "Missing error boundaries and undefined checks on initial empty state.",
          howToAvoid: "Provide clean fallback UI for empty states and wrap all JSON parses in try/catch blocks.",
        },
      ];
  }
}

/**
 * Generate a complete, tailor-made IdeaBlueprint from raw user input and user choices.
 */
export function generateBlueprint(
  ideaText: string,
  userChoices: Record<string, string> = {}
): IdeaBlueprint {
  const category = detectCategory(ideaText);
  const questions = getClarifyingQuestions(ideaText);

  // Fill default choices if not provided
  const activeChoices: Record<string, string> = { ...userChoices };
  questions.forEach((q) => {
    if (!activeChoices[q.id]) {
      const rec = q.options.find((o) => o.recommendation) || q.options[0];
      activeChoices[q.id] = rec.id;
    }
  });

  // Extract clean project title
  let clean = ideaText
    .replace(/^i want to build (an? )?/i, "")
    .replace(/^i need (an? )?/i, "")
    .replace(/^a simple /i, "")
    .replace(/^a minimal /i, "")
    .replace(/^an? /i, "")
    .trim();

  const clause = clean.split(/[.,;\n]| with | that | for | featuring | where /i)[0].trim();
  const projectTitle =
    clause.length >= 5 && clause.length <= 48
      ? clause
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      : getFallbackTitle(category);

  // Construct Strategy Decision sentence
  const strategyDecision = buildStrategySummary(category, activeChoices);

  // Summary
  const summary = `${projectTitle}: ${buildSummaryDetail(category, activeChoices, ideaText)}`;

  // Pitfalls specific to this build
  const pitfalls = getPitfallsForCategory(category, activeChoices);

  // Calibrated Tech Stack
  const techStack = buildTechStack(category, activeChoices);

  // Phased Roadmap
  const roadmap = buildRoadmap(category, activeChoices, projectTitle);

  // Next Actions
  const nextActions = buildNextActions(category, activeChoices);

  // Targeted Resources
  const resources = buildResources(category, activeChoices);

  // AI Agent Pairing Guide & First Prompt
  const agentGuide = buildAgentGuide(category, activeChoices, projectTitle, summary, roadmap, nextActions);

  const matchedSkills = retrieveKnowledge(ideaText, activeChoices);
  const nodes: RoadmapNode[] = buildRoadmapNodes(matchedSkills[0], projectTitle, summary);

  return {
    projectTitle,
    summary,
    strategyDecision,
    pitfalls,
    roadmap,
    nextActions,
    techStack,
    resources,
    agentGuide,
    nodes,
    isFallback: true,
    userChoices: activeChoices,
  };
}

function getFallbackTitle(category: ProjectCategory): string {
  const titles: Record<ProjectCategory, string> = {
    extension: "Smart Browser Companion Extension",
    mobile: "Touch-First Mobile Companion",
    scraper: "Automated Data Collector & Digest",
    bot: "Event-Driven Interactive Bot",
    cli: "Developer Terminal Automation Tool",
    flashcards: "Spaced Repetition Flashcard Studio",
    finance: "Privacy-First Expense Tracker",
    habit: "Adaptive Daily Streak Tracker",
    ai_tool: "AI-Powered Productivity Assistant",
    ecommerce: "Curated Storefront & Checkout",
    general_web: "Modern Single-Page Application",
  };
  return titles[category];
}

function buildStrategySummary(category: ProjectCategory, choices: Record<string, string>): string {
  if (category === "scraper") {
    const isStatic = choices["data_source"] !== "dynamic_js";
    return `Strategy calibrated for ${
      isStatic ? "high-speed static HTML parsing with Cheerio" : "dynamic DOM parsing with Playwright"
    }, isolated local storage to prevent rate-limiting, and an on-demand refresh trigger to guarantee 100% demo stability.`;
  }
  if (category === "extension") {
    return `Strategy calibrated for Chrome Manifest V3 popup architecture with zero runtime bundle bloat and sandbox-safe chrome.storage.local persistence.`;
  }
  if (category === "mobile") {
    return `Strategy calibrated for rapid Expo Go mobile preview, eliminating Xcode/Android Studio native compile overhead, and using 100% offline-first AsyncStorage.`;
  }
  if (category === "habit") {
    const isAdaptive = choices["streak_policy"] !== "strict_daily";
    return `Strategy calibrated for ${
      isAdaptive ? "adaptive momentum tracking with forgiving grace periods" : "strict daily streak logging"
    }, paired with zero-auth browser LocalStorage for instant judge evaluation.`;
  }
  if (category === "flashcards") {
    return `Strategy calibrated for a tactile 3-Box Leitner spaced repetition engine, 3D CSS card flip transforms, and pre-seeded starter decks to ensure instant engagement.`;
  }
  if (category === "finance") {
    return `Strategy calibrated for strict client-side financial privacy, integer-cent calculations to avoid rounding bugs, and one-click CSV backup export.`;
  }
  if (category === "ai_tool") {
    return `Strategy calibrated with an automatic heuristic fallback to guarantee zero demo failures if API quotas run out, paired with structured response cards.`;
  }
  return `Strategy calibrated for a lightweight single-page architecture with local state, fast hydration, and zero backend infrastructure overhead for Phase 1.`;
}

function buildSummaryDetail(category: ProjectCategory, choices: Record<string, string>, rawText: string): string {
  if (rawText.length > 35 && rawText.length < 180 && !rawText.toLowerCase().startsWith("i want to")) {
    return rawText.trim();
  }
  const desc: Record<ProjectCategory, string> = {
    extension: "A lightweight Chrome extension that optimizes page workflows with zero-latency local storage.",
    mobile: "A tactile mobile application built for fast daily interactions and offline-first reliability.",
    scraper: "An automated data collector and dashboard that aggregates target records, cleans duplicates, and presents a filterable digest.",
    bot: "An event-driven bot that automates notifications and responds to user commands with styled embeds.",
    cli: "A high-performance command-line utility featuring interactive prompts, visual spinners, and cross-platform support.",
    flashcards: "A spaced repetition flashcard studio with interactive 3D card flips and Leitner box scheduling.",
    finance: "A privacy-first personal finance tracker with zero-cloud storage, category breakdowns, and visual expense insights.",
    habit: "A friction-free habit tracker featuring streak momentum metrics, tactile checkmarks, and offline-first local storage.",
    ai_tool: "A clean AI companion tool combining structured prompt presets, fast responses, and reliable offline fallbacks.",
    ecommerce: "A modern storefront prototype with instant category filtering, responsive cart drawer, and frictionless checkout.",
    general_web: "A single-page web application featuring responsive design, tactile interactions, and zero-database local persistence.",
  };
  return desc[category];
}

function buildTechStack(category: ProjectCategory, choices: Record<string, string>): StackItem[] {
  if (category === "extension") {
    return [
      {
        category: "Extension Architecture",
        name: "Chrome Manifest V3",
        reason: "Current industry standard for modern extensions with service worker background scripts.",
      },
      {
        category: "Popup UI",
        name: "Vanilla HTML/CSS + TypeScript (or Vite)",
        reason: "Zero runtime bloat guarantees immediate popup opening upon toolbar click.",
      },
      {
        category: "Storage",
        name: "chrome.storage.local",
        reason: "Asynchronous, sandbox-safe storage preserved across browser restarts without permissions.",
      },
      {
        category: "Permissions",
        name: "activeTab",
        reason: "Eliminates aggressive browser warning banners on extension installation.",
      },
    ];
  }

  if (category === "mobile") {
    return [
      {
        category: "Framework",
        name: "React Native + Expo",
        reason: "Instant live preview on your phone with Expo Go; zero native toolchain setup required.",
      },
      {
        category: "Styling",
        name: "NativeWind (Tailwind CSS for React Native)",
        reason: "Utility styles that translate directly to native iOS and Android layout primitives.",
      },
      {
        category: "Navigation",
        name: "Expo Router",
        reason: "File-based native routing with fluid screen transitions and automatic header management.",
      },
      {
        category: "Persistence",
        name: "@react-native-async-storage/async-storage",
        reason: "Simple key-value mobile storage that works 100% offline across device restarts.",
      },
    ];
  }

  if (category === "scraper") {
    const isStatic = choices["data_source"] !== "dynamic_js";
    return [
      {
        category: "Scraping Engine",
        name: isStatic ? "Cheerio + Node Fetch" : "Playwright Headless Browser",
        reason: isStatic
          ? "Ultra-fast HTML parsing (under 200ms per request) with minimal CPU usage."
          : "Executes JavaScript on dynamic single-page applications before extracting data.",
      },
      {
        category: "Dashboard UI",
        name: "Next.js 14 App Router",
        reason: "Houses API endpoints and modern client presentation in a single unified repository.",
      },
      {
        category: "Storage",
        name: "SQLite via better-sqlite3 (or Local JSON)",
        reason: "Zero-configuration relational database stored as a single local file.",
      },
      {
        category: "Styling",
        name: "Tailwind CSS",
        reason: "High-density data tables and card layouts with clean responsive filters.",
      },
    ];
  }

  // Default Web App / Habit / Flashcards
  return [
    {
      category: "Frontend Framework",
      name: "Next.js 14 (App Router)",
      reason: "Fast client hydration, strict TypeScript contracts, and one-click Vercel deployment.",
    },
    {
      category: "Styling & UI",
      name: "Tailwind CSS",
      reason: "Clean responsive utilities with zero runtime CSS overhead.",
    },
    {
      category: "Language",
      name: "TypeScript",
      reason: "Strict type safety preventing runtime crashes and improving AI agent pairing.",
    },
    {
      category: "Persistence",
      name: "Browser LocalStorage",
      reason: "Zero-database, 100% offline-first prototype that anyone can test with zero sign-up friction.",
    },
  ];
}

function buildRoadmap(category: ProjectCategory, choices: Record<string, string>, title: string): BlueprintPhase[] {
  if (category === "scraper") {
    return [
      {
        phase: "Phase 1",
        title: "HTML Parser & Offline Fixture Extraction",
        description: "Write a standalone parser script that extracts required data fields from a saved HTML fixture and verifies data cleanliness.",
      },
      {
        phase: "Phase 2",
        title: "Data Normalization & Hash Deduplication",
        description: "Generate unique SHA256 hashes for each record, eliminate duplicate items, and save structured records to local storage.",
      },
      {
        phase: "Phase 3",
        title: "Interactive Web Dashboard with Search",
        description: "Build filterable grid view with search by keyword, category tags, and one-click external link opening.",
      },
      {
        phase: "Phase 4",
        title: "Manual Refresh Trigger & CSV Export",
        description: "Add an on-demand 'Fetch Latest Records' button with loading progress bar and instant CSV download.",
      },
    ];
  }

  if (category === "extension") {
    return [
      {
        phase: "Phase 1",
        title: "Manifest V3 Skeleton & Popup View",
        description: "Setup manifest.json, action icon, popup HTML layout, and verify the extension loads in chrome://extensions in developer mode.",
      },
      {
        phase: "Phase 2",
        title: "Active Tab Content Script & DOM Extraction",
        description: "Inject a lightweight content script to read page text, extract target data, and communicate back to the popup.",
      },
      {
        phase: "Phase 3",
        title: "Storage Persistence & Quick Actions",
        description: "Save collected data to chrome.storage.local with search, export to JSON/CSV, and item removal.",
      },
      {
        phase: "Phase 4",
        title: "Keyboard Shortcuts & Store Packaging",
        description: "Add hotkey activation, error boundary handling, and package a production .zip ready for submission.",
      },
    ];
  }

  return [
    {
      phase: "Phase 1",
      title: "Core Feature Prototype & Local State",
      description: "Build the primary single-page layout, interactive input/toggle mechanism, and verify state updates cleanly.",
    },
    {
      phase: "Phase 2",
      title: "Persistence & Offline Reliability",
      description: "Connect browser localStorage so all items, progress, and settings persist across page reloads.",
    },
    {
      phase: "Phase 3",
      title: "Tactile Feedback & Visual Polish",
      description: "Add micro-animations, completion badges, empty states, and responsive layout refinements.",
    },
    {
      phase: "Phase 4",
      title: "Edge Cases & Demo Readiness",
      description: "Handle boundary conditions (empty inputs, long titles, reset flows) and rehearse a 2-minute demo walk-through.",
    },
  ];
}

function buildNextActions(category: ProjectCategory, choices: Record<string, string>): NextAction[] {
  if (category === "scraper") {
    return [
      {
        step: 1,
        action: "Create offline HTML sample fixture in scripts/fixtures/sample.html",
        detail: "Save a sample of the target webpage to develop selectors offline without hitting rate limits.",
      },
      {
        step: 2,
        action: "Define Item schema in types/scraper.ts",
        detail: "Draft clean interfaces with title, url, timestamp, category, and unique contentHash.",
      },
      {
        step: 3,
        action: "Write Cheerio extraction function and test in console",
        detail: "Parse titles, links, and dates, verifying zero undefined values are produced.",
      },
      {
        step: 4,
        action: "Build Next.js dashboard route to display collected items",
        detail: "Render responsive data cards with live search bar and direct links to original posts.",
      },
    ];
  }

  if (category === "extension") {
    return [
      {
        step: 1,
        action: "Create manifest.json declaring Manifest V3 and activeTab permission",
        detail: "Define action popup entrypoint and 16/48/128px placeholder icon references.",
      },
      {
        step: 2,
        action: "Build popup UI (360x480px) with primary action trigger",
        detail: "Create clean HTML/CSS layout with status indicator and main button.",
      },
      {
        step: 3,
        action: "Implement message passing between popup and content script",
        detail: "Use chrome.tabs.sendMessage to trigger data extraction from the current active tab.",
      },
      {
        step: 4,
        action: "Test local unpacked extension loading",
        detail: "Open chrome://extensions, toggle Developer mode, and verify zero error badges appear.",
      },
    ];
  }

  return [
    {
      step: 1,
      action: "Define core domain interfaces in types/index.ts",
      detail: "Establish explicit data contracts before writing components.",
    },
    {
      step: 2,
      action: "Build primary interaction component with tactile state",
      detail: "Create an accessible, tactile button/form with optimistic UI updates.",
    },
    {
      step: 3,
      action: "Connect browser localStorage helper with error handling",
      detail: "Verify adding items, marking complete, and refreshing page maintains exact state.",
    },
    {
      step: 4,
      action: "Add 3 curated starter items to initial state",
      detail: "Ensure first-time visitors see populated cards ready to test immediately.",
    },
  ];
}

function buildResources(category: ProjectCategory, choices: Record<string, string>): ResourceItem[] {
  if (category === "scraper") {
    return [
      {
        type: "Official Docs",
        title: "Cheerio HTML Selector and Traversal Guide",
        url: "https://cheerio.js.org/",
      },
      {
        type: "Architecture Guide",
        title: "Next.js Route Handlers & Serverless APIs",
        url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
      },
      {
        type: "Database Guide",
        title: "SQLite Fast Queries & File Schema Essentials",
        url: "https://sqlite.org/docs.html",
      },
    ];
  }

  if (category === "extension") {
    return [
      {
        type: "Official Docs",
        title: "Chrome Extension Manifest V3 Guide",
        url: "https://developer.chrome.com/docs/extensions/mv3/getstarted/",
      },
      {
        type: "API Reference",
        title: "Chrome Storage API (chrome.storage.local)",
        url: "https://developer.chrome.com/docs/extensions/reference/storage/",
      },
      {
        type: "Tutorial",
        title: "MDN Building a Cross-Browser Extension",
        url: "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions",
      },
    ];
  }

  return [
    {
      type: "Official Docs",
      title: "Next.js App Router Documentation",
      url: "https://nextjs.org/docs",
    },
    {
      type: "Styling Reference",
      title: "Tailwind CSS Layout & Utility Reference",
      url: "https://tailwindcss.com/docs",
    },
    {
      type: "Hackathon Guide",
      title: "Devpost AI Basics: Coding Agent Pair Programming",
      url: "https://devpost.com",
    },
  ];
}

function buildAgentGuide(
  category: ProjectCategory,
  choices: Record<string, string>,
  title: string,
  summary: string,
  roadmap: BlueprintPhase[],
  nextActions: NextAction[]
): { workflowTips: string[]; firstPrompt: string } {
  const tips = [
    "Always ask your coding agent to implement one small verifiable slice at a time.",
    "Never allow the agent to edit more than 2 files per prompt before verifying the change in the browser/terminal.",
    "Keep types strictly defined in a dedicated types/ file so the agent adheres to strict boundaries.",
    "When a bug occurs, paste the terminal error directly into the agent prompt with the exact line number.",
  ];

  const firstPrompt = `I am building ${title}.

PROJECT SUMMARY:
${summary}

STRATEGY & ARCHITECTURE CONSTRAINTS:
- Keep the implementation strictly focused on Phase 1: ${roadmap[0].title}.
- ${roadmap[0].description}
- Do NOT install complex backend dependencies or authentication for this slice.
- Maintain all types in a dedicated types/ file.

IMMEDIATE STEPS:
1. ${nextActions[0].action} (${nextActions[0].detail})
2. ${nextActions[1].action} (${nextActions[1].detail})
3. ${nextActions[2].action} (${nextActions[2].detail})
4. ${nextActions[3].action} (${nextActions[3].detail})

Please write complete, self-contained code with zero placeholders like '// add here'. Start with Step 1 by writing the type definitions and baseline component.`;

  return { workflowTips: tips, firstPrompt };
}
