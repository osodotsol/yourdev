import { IdeaBlueprint, BlueprintPhase, NextAction, StackItem, ResourceItem } from "@/types/blueprint";

type ProjectCategory =
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

interface CategoryTemplate {
  titlePrefix: string;
  defaultTitle: string;
  stack: StackItem[];
  resources: ResourceItem[];
  phase1Title: string;
  phase1Desc: string;
  phase2Title: string;
  phase2Desc: string;
  phase3Title: string;
  phase3Desc: string;
  phase4Title: string;
  phase4Desc: string;
  actions: { action: string; detail: string }[];
  agentTips: string[];
}

const TEMPLATES: Record<ProjectCategory, CategoryTemplate> = {
  extension: {
    titlePrefix: "Browser Extension",
    defaultTitle: "Smart Browser Companion Extension",
    stack: [
      {
        category: "Extension Architecture",
        name: "Chrome Manifest V3",
        reason: "Current industry standard for modern browser extensions with declarative permissions.",
      },
      {
        category: "UI Framework",
        name: "Vanilla HTML/CSS + TypeScript (or Vite React)",
        reason: "Zero runtime bloat ensures instantaneous popup opening speed.",
      },
      {
        category: "Storage",
        name: "chrome.storage.local",
        reason: "Asynchronous, sandbox-safe storage preserved across browser restarts.",
      },
      {
        category: "Bundler",
        name: "Vite",
        reason: "Fast development reload and seamless multi-entrypoint build for popup and background scripts.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Chrome Extension Manifest V3 Guide",
        url: "https://developer.chrome.com/docs/extensions/mv3/getstarted/",
      },
      {
        type: "API Reference",
        title: "Chrome Storage API Reference",
        url: "https://developer.chrome.com/docs/extensions/reference/storage/",
      },
      {
        type: "Interactive Tutorial",
        title: "MDN Building a Cross-Browser Extension",
        url: "https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions",
      },
    ],
    phase1Title: "Manifest V3 Skeleton & Popup View",
    phase1Desc: "Setup manifest.json, action icon, popup HTML layout, and verify the extension loads in chrome://extensions in developer mode.",
    phase2Title: "Active Tab Content Script & DOM Extraction",
    phase2Desc: "Inject a lightweight content script to read page text, extract target data, and communicate back to the popup.",
    phase3Title: "Storage Persistence & Quick Actions",
    phase3Desc: "Save collected data to chrome.storage.local with search, export to JSON/CSV, and item removal.",
    phase4Title: "Keyboard Shortcuts & Store Packaging",
    phase4Desc: "Add hotkey activation, error boundary handling, and package a production .zip ready for submission.",
    actions: [
      {
        action: "Create manifest.json with Manifest V3 specifications",
        detail: "Declare basic permissions (storage, activeTab), action popup, and icon assets.",
      },
      {
        action: "Build popup UI with status indicator and main button",
        detail: "Create clean HTML/CSS popup sized at 360x480px with zero external styling dependencies.",
      },
      {
        action: "Implement message passing between popup and content script",
        detail: "Use chrome.tabs.sendMessage to trigger data extraction from the current browser tab.",
      },
      {
        action: "Test local unpacked extension loading",
        detail: "Open chrome://extensions, toggle Developer mode, and verify zero error badges appear.",
      },
    ],
    agentTips: [
      "Tell the agent: 'We are using Chrome Manifest V3, not V2 — do not use background pages, use service workers.'",
      "Ask the agent to verify permission scope so Chrome does not display aggressive warning banners to users.",
      "Never mix DOM access in the service worker; use content scripts with message passing.",
      "Test by reloading the extension in chrome://extensions after every discrete file edit.",
    ],
  },

  mobile: {
    titlePrefix: "Mobile App",
    defaultTitle: "Cross-Platform Mobile Application",
    stack: [
      {
        category: "Framework",
        name: "React Native + Expo",
        reason: "Fastest path from idea to real iOS/Android preview without native Xcode/Android Studio setup.",
      },
      {
        category: "Styling",
        name: "NativeWind (Tailwind CSS for React Native)",
        reason: "Consistent utility styles that map directly to native iOS and Android layout primitives.",
      },
      {
        category: "Navigation",
        name: "Expo Router",
        reason: "File-based native routing with automatic screen transitions and deep linking.",
      },
      {
        category: "Storage",
        name: "@react-native-async-storage/async-storage",
        reason: "Simple key-value mobile storage that works offline across device restarts.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Expo Documentation & Quickstart",
        url: "https://docs.expo.dev/",
      },
      {
        type: "Component Reference",
        title: "React Native Core Components & APIs",
        url: "https://reactnative.dev/docs/components-and-apis",
      },
      {
        type: "Navigation Guide",
        title: "Expo Router Navigation Essentials",
        url: "https://docs.expo.dev/router/introduction/",
      },
    ],
    phase1Title: "Expo Scaffold & Core Screen Layout",
    phase1Desc: "Initialize Expo blank TypeScript template, configure basic tab navigation, and construct the primary screen skeleton.",
    phase2Title: "Interactive Input Form & Local State",
    phase2Desc: "Build touch-friendly input fields with validation, optimistic list rendering, and tactile feedback.",
    phase3Title: "Offline Async Storage & Swipe Gestures",
    phase3Desc: "Persist items with AsyncStorage, add swipe-to-delete actions, and handle pull-to-refresh.",
    phase4Title: "Haptic Feedback & Expo Go Device Testing",
    phase4Desc: "Add expo-haptics on action triggers and verify real-device performance using the Expo Go mobile app.",
    actions: [
      {
        action: "Initialize Expo project with TypeScript template",
        detail: "Run npx create-expo-app --template blank-typescript and verify it boots with Expo Go.",
      },
      {
        action: "Define domain data models in types/index.ts",
        detail: "Draft clean interfaces for the primary mobile entities and storage keys.",
      },
      {
        action: "Build main screen with native SafeView and FlatList",
        detail: "Ensure layout accommodates device notches and dynamic screen height variations.",
      },
      {
        action: "Connect AsyncStorage helper functions for read/write",
        detail: "Create safe wrapper functions with try/catch fallback to prevent mobile app crashes.",
      },
    ],
    agentTips: [
      "Tell the agent: 'Use Expo SDK and React Native primitives (<View>, <Text>, <Pressable>), not web HTML tags.'",
      "Avoid raw HTML div/span tags which cause instant red-screen fatal errors in React Native.",
      "Instruct the agent to use FlatList rather than ScrollView for lists with variable item counts.",
      "Keep dependencies strictly within the Expo ecosystem to avoid native linking issues.",
    ],
  },

  scraper: {
    titlePrefix: "Collector & Scraper",
    defaultTitle: "Automated Data Collector & Digest Dashboard",
    stack: [
      {
        category: "Scraping Engine",
        name: "Node.js + Cheerio (or Playwright for JS-heavy pages)",
        reason: "Fast, lightweight HTML parsing that respects robots.txt and handles concurrent fetches.",
      },
      {
        category: "Frontend UI",
        name: "Next.js 14 App Router",
        reason: "Unified full-stack architecture running scheduled cron routes and client UI in one repo.",
      },
      {
        category: "Data Storage",
        name: "SQLite via better-sqlite3 (or Prisma / local JSON)",
        reason: "Zero-configuration, single-file relational database perfect for local demos.",
      },
      {
        category: "Styling",
        name: "Tailwind CSS",
        reason: "High-density data tables and card layouts with clean responsive filters.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Cheerio HTML Parsing API Guide",
        url: "https://cheerio.js.org/",
      },
      {
        type: "Framework Reference",
        title: "Next.js Route Handlers (API Endpoints)",
        url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
      },
      {
        type: "Database Guide",
        title: "SQLite Fast Queries and Schema Basics",
        url: "https://sqlite.org/docs.html",
      },
    ],
    phase1Title: "HTML Parser & Sample Seed Extraction",
    phase1Desc: "Write a resilient fetcher that retrieves the target URL, parses CSS selectors, and outputs sanitized JSON records.",
    phase2Title: "Data Normalization & Deduplication",
    phase2Desc: "Filter duplicate URLs, standardize dates and titles, and store clean records into local storage.",
    phase3Title: "Web Dashboard with Filter & Search",
    phase3Desc: "Build a filterable grid view with search by keyword, category tags, and one-click external link opening.",
    phase4Title: "Scheduled Refresh & CSV / JSON Export",
    phase4Desc: "Add a manual 'Refresh Data Now' trigger with loading progress bar and instant CSV download.",
    actions: [
      {
        action: "Write standalone fetch and parse script in scripts/scrape.ts",
        detail: "Test on a live or saved HTML fixture to verify selectors match required data fields.",
      },
      {
        action: "Define Item schema with title, link, date, and unique hash",
        detail: "Include a clean MD5 or SHA256 content hash to effortlessly skip already-collected items.",
      },
      {
        action: "Build Next.js Route Handler /api/items to serve collected data",
        detail: "Return structured JSON with cache headers and error status handling.",
      },
      {
        action: "Create dashboard view with search bar and sort dropdown",
        detail: "Wire instantaneous client-side search filtering across titles and categories.",
      },
    ],
    agentTips: [
      "Ask the agent to download an offline HTML sample fixture first so you don't get IP-blocked during development.",
      "Instruct the agent to add polite request headers (User-Agent, rate limiting delay) to scraping requests.",
      "Keep the scraping engine modularized in a separate service function independent of the React UI.",
      "Handle missing DOM nodes gracefully with optional chaining (.text() || 'N/A').",
    ],
  },

  bot: {
    titlePrefix: "Bot & Automation",
    defaultTitle: "Interactive Event & Notification Bot",
    stack: [
      {
        category: "Runtime",
        name: "Node.js (v18+) with TypeScript",
        reason: "Strong async event handling and broad SDK compatibility.",
      },
      {
        category: "Bot Client",
        name: "discord.js (or grammY for Telegram)",
        reason: "Official, fully typed client library with slash command support and event emitters.",
      },
      {
        category: "Configuration",
        name: "dotenv",
        reason: "Secure environment variable loading for bot tokens and channel IDs.",
      },
      {
        category: "Persistence",
        name: "lowdb (or SQLite)",
        reason: "Lightweight, zero-setup JSON database for server guild configs and user state.",
      },
    ],
    resources: [
      {
        type: "Official Guide",
        title: "Discord.js Official Getting Started Guide",
        url: "https://discordjs.guide/",
      },
      {
        type: "API Documentation",
        title: "Discord Developer Portal Documentation",
        url: "https://discord.com/developers/docs/intro",
      },
      {
        type: "Slash Commands",
        title: "Discord Application Slash Commands Guide",
        url: "https://discordjs.guide/creating-your-bot/slash-commands.html",
      },
    ],
    phase1Title: "Bot Gateway Connection & Ping Slash Command",
    phase1Desc: "Register bot credentials, connect to gateway with required intents, and implement a responsive /ping command.",
    phase2Title: "Core Command Logic & Embedded Responses",
    phase2Desc: "Build the primary slash command suite with styled embeds, interactive buttons, and validation.",
    phase3Title: "State Storage & Automated Triggers",
    phase3Desc: "Store user preferences and configure interval timers or webhooks that broadcast automated updates.",
    phase4Title: "Error Handling & Production Keep-Alive",
    phase4Desc: "Wrap event handlers in robust try/catch boundaries and deploy to a free container host (e.g. Railway/Render).",
    actions: [
      {
        action: "Register application and bot token in Discord Developer Portal",
        detail: "Enable privileged Gateway Intents (Guilds, Messages) and generate an invite link.",
      },
      {
        action: "Create deploy-commands.ts script to register slash commands",
        detail: "Use REST API to register guild-specific slash commands for instant local testing.",
      },
      {
        action: "Build main client index.ts with interactionCreate listener",
        detail: "Route incoming interactions to dedicated command handler files.",
      },
      {
        action: "Implement clean EmbedBuilder response card",
        detail: "Format output with custom brand colors, timestamps, and descriptive fields.",
      },
    ],
    agentTips: [
      "Tell the agent: 'Never hardcode the bot token. Always read process.env.DISCORD_TOKEN.'",
      "Ensure the agent uses deferReply() for any command taking longer than 2.5 seconds to prevent timeout errors.",
      "Instruct the agent to separate command definitions from execution logic.",
      "Verify gateway intent permissions before implementing member or message tracking.",
    ],
  },

  cli: {
    titlePrefix: "CLI Tool",
    defaultTitle: "Developer Terminal Productivity Tool",
    stack: [
      {
        category: "Runtime",
        name: "Node.js + TypeScript",
        reason: "Cross-platform execution across macOS, Windows PowerShell, and Linux.",
      },
      {
        category: "CLI Framework",
        name: "Commander.js",
        reason: "Intuitive argument parsing, flag configuration, and automatic --help documentation.",
      },
      {
        category: "Terminal Aesthetics",
        name: "Chalk + Ora (or Picocolors + Clack)",
        reason: "Vibrant terminal colorization, sleek spinners, and interactive command-line prompts.",
      },
      {
        category: "Executable Packing",
        name: "tsup (or pkg)",
        reason: "Bundles TypeScript code into a single executable binary with a #!/usr/bin/env node shebang.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Commander.js CLI Complete Documentation",
        url: "https://github.com/tj/commander.js",
      },
      {
        type: "Interactive Reference",
        title: "@clack/prompts Interactive Terminal UI",
        url: "https://github.com/natemoo-re/clack",
      },
      {
        type: "Packaging Guide",
        title: "Building Executable Node CLI Tools Guide",
        url: "https://nodejs.org/api/cli.html",
      },
    ],
    phase1Title: "Executable Entrypoint & Command Parser",
    phase1Desc: "Setup package.json 'bin' entrypoint, configure Commander with root options, and verify 'npx .' runs cleanly.",
    phase2Title: "Interactive Prompts & Animated Spinner",
    phase2Desc: "Prompt user for required inputs with multi-select choices and show an Ora spinner during async tasks.",
    phase3Title: "Core File Transformation Engine",
    phase3Desc: "Implement the primary logic (file generation, transformation, or API query) with safe error reporting.",
    phase4Title: "Global npm Linking & Config File Support",
    phase4Desc: "Add ~/.config file support to remember user defaults and verify npm link works globally in the terminal.",
    actions: [
      {
        action: "Add 'bin' field in package.json pointing to dist/index.js",
        detail: "Add #!/usr/bin/env node at the top of src/index.ts and configure tsup build.",
      },
      {
        action: "Configure Commander program with name, version, and description",
        detail: "Implement basic command with required arguments and optional flags.",
      },
      {
        action: "Add styled terminal output with Chalk and Ora spinner",
        detail: "Provide immediate visual feedback when long-running operations begin and complete.",
      },
      {
        action: "Test local execution using npm run build and node ./dist/index.js",
        detail: "Verify --help renders cleanly and flags parse accurately.",
      },
    ],
    agentTips: [
      "Tell the agent: 'Ensure the output binary includes the shebang line #!/usr/bin/env node.'",
      "Ask the agent to exit with process.exit(1) on fatal errors so CI/CD scripts can detect failures.",
      "Instruct the agent to support both interactive prompts and non-interactive command-line flags.",
      "Never print unformatted raw error stack traces to standard output; format clean error notices.",
    ],
  },

  flashcards: {
    titlePrefix: "Learning App",
    defaultTitle: "Spaced Repetition Flashcard Studio",
    stack: [
      {
        category: "Framework",
        name: "Next.js 14 App Router (React)",
        reason: "Fast client hydration, instant card transitions, and simple serverless deployment.",
      },
      {
        category: "Styling",
        name: "Tailwind CSS",
        reason: "Smooth 3D flip card animations, responsive mobile layout, and high-contrast typography.",
      },
      {
        category: "Persistence",
        name: "Browser LocalStorage",
        reason: "Instant zero-login offline practice with zero setup friction.",
      },
      {
        category: "Audio / Feedback",
        name: "Web Audio API / Canvas Confetti",
        reason: "Tactile card flip audio and celebratory milestone animations on study completion.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Next.js App Router Documentation",
        url: "https://nextjs.org/docs",
      },
      {
        type: "Algorithm Reference",
        title: "Leitner Box System & Spaced Repetition Principles",
        url: "https://en.wikipedia.org/wiki/Leitner_system",
      },
      {
        type: "Animation Guide",
        title: "Tailwind 3D Transform & Card Flip Guide",
        url: "https://tailwindcss.com/docs",
      },
    ],
    phase1Title: "Interactive 3D Flashcard & Deck Viewer",
    phase1Desc: "Build the core study viewport: a flip card that rotates on click/spacebar and advances on 'Got it' or 'Review again'.",
    phase2Title: "Deck Creation & LocalStorage Persistence",
    phase2Desc: "Add deck creation modal, card editor form, and JSON export/import for backing up flashcard decks.",
    phase3Title: "Spaced Repetition Box Scheduling Algorithm",
    phase3Desc: "Implement a 3-box Leitner scheduling engine that shows harder cards more frequently until mastered.",
    phase4Title: "Audio Feedback & Study Session Summary",
    phase4Desc: "Add card flip sound effects, completion confetti, and a review summary with accuracy percentages.",
    actions: [
      {
        action: "Define Flashcard and Deck interfaces in types/flashcard.ts",
        detail: "Include id, question, answer, boxLevel (1-3), lastReviewedAt, and nextReviewDue.",
      },
      {
        action: "Build 3D flip card component with Tailwind CSS transforms",
        detail: "Create smooth 0.3s CSS perspective rotation triggered by tap, click, or spacebar.",
      },
      {
        action: "Implement Leitner Box progression logic",
        detail: "Move card to Box 2 on correct answer; return to Box 1 on missed answer.",
      },
      {
        action: "Add 5 sample starter cards in initial state",
        detail: "Ensure first-time visitors see an engaging deck ready to test immediately without typing.",
      },
    ],
    agentTips: [
      "Tell the agent: 'Build the card flip purely in CSS using perspective-1000 and transform-style-3d.'",
      "Avoid complex backend databases for Phase 1; prioritize zero-friction localStorage persistence.",
      "Instruct the agent to add keyboard shortcuts (Space to flip, 1 for Fail, 2 for Pass) for rapid testing.",
      "Ensure font sizes inside flashcards scale cleanly for both short terms and long definitions.",
    ],
  },

  finance: {
    titlePrefix: "Finance Tracker",
    defaultTitle: "Privacy-First Expense & Budget Tracker",
    stack: [
      {
        category: "Framework",
        name: "Next.js 14 App Router",
        reason: "Clean reactive state, fast rendering, and zero-server privacy architecture.",
      },
      {
        category: "Styling",
        name: "Tailwind CSS",
        reason: "Financial tables, status pill badges, and balance metrics.",
      },
      {
        category: "Data Visualization",
        name: "Lightweight SVG Charts (or Recharts)",
        reason: "Zero-dependency breakdown charts showing spending by category without heavy bundle size.",
      },
      {
        category: "Storage",
        name: "Browser LocalStorage + CSV Export",
        reason: "Zero financial data leaves the user's browser, providing 100% privacy and trust.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Next.js App Router Documentation",
        url: "https://nextjs.org/docs",
      },
      {
        type: "Data Formatting",
        title: "Intl.NumberFormat Currency API Guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat",
      },
      {
        type: "Interactive Tutorial",
        title: "Tailwind CSS Responsive Data Table Design",
        url: "https://tailwindcss.com/docs",
      },
    ],
    phase1Title: "Transaction Entry Form & Balance Overview",
    phase1Desc: "Build quick-entry form (amount, category, description, date) and display live Total Balance, Income, and Expense stats.",
    phase2Title: "Filterable Transaction Ledger",
    phase2Desc: "Interactive table with category filters, sort by date/amount, search bar, and one-click transaction deletion.",
    phase3Title: "Category Spending Breakdown Chart",
    phase3Desc: "Clean SVG progress bars or donut chart visualizing monthly budget utilization by category.",
    phase4Title: "CSV Export & Monthly Budget Alerts",
    phase4Desc: "Add one-click CSV file download and visual warnings when a category exceeds its monthly target.",
    actions: [
      {
        action: "Define Transaction schema in types/finance.ts",
        detail: "Include id, amount, type ('income'|'expense'), category, note, and ISO timestamp.",
      },
      {
        action: "Create metric cards for Total Balance, Monthly Spend, and Income",
        detail: "Use Intl.NumberFormat for clean currency formatting ($1,240.00).",
      },
      {
        action: "Build quick transaction form with category chips",
        detail: "Offer one-tap category selection (Food, Transport, Subscriptions, Health) with instant add.",
      },
      {
        action: "Connect localStorage persistence and calculate live totals",
        detail: "Ensure metrics update instantaneously upon each transaction without page reload.",
      },
    ],
    agentTips: [
      "Tell the agent: 'Store financial amounts as integers in cents or use strict decimal formatting to avoid float rounding errors.'",
      "Emphasize privacy: all data stays local in the user's browser with no third-party analytics.",
      "Instruct the agent to use standard browser Intl.NumberFormat rather than pulling in heavy currency libraries.",
      "Include a sample transaction generator so first-time users immediately see charts populated.",
    ],
  },

  habit: {
    titlePrefix: "Habit Tracker",
    defaultTitle: "Adaptive Daily Habit & Streak Tracker",
    stack: [
      {
        category: "Framework",
        name: "Next.js 14 App Router",
        reason: "Fast single-page hydration, zero-config TypeScript, and simple deployment to Vercel.",
      },
      {
        category: "Styling & UI",
        name: "Tailwind CSS",
        reason: "Clean responsive utilities with zero runtime CSS overhead.",
      },
      {
        category: "Language",
        name: "TypeScript",
        reason: "Strict type contracts preventing silent bugs and improving AI agent pairing.",
      },
      {
        category: "Persistence",
        name: "Browser LocalStorage",
        reason: "Zero setup, 100% offline-first storage with no login wall.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Next.js App Router Documentation",
        url: "https://nextjs.org/docs",
      },
      {
        type: "Styling Reference",
        title: "Tailwind CSS Utility & Layout Reference",
        url: "https://tailwindcss.com/docs",
      },
      {
        type: "Workflow Guide",
        title: "Devpost AI Basics: Coding Agent Pair Programming",
        url: "https://devpost.com",
      },
    ],
    phase1Title: "Core Habit Logger & Local Persistence",
    phase1Desc: "Single-page UI with habit creation, daily toggle completion, streak counter, and localStorage persistence.",
    phase2Title: "Streak Analytics & Friction Detection",
    phase2Desc: "Visual weekly completion matrix, streak analytics, and detection of high-risk lapse patterns.",
    phase3Title: "Badge & Milestone Celebrations",
    phase3Desc: "7-day streak animations, unlockable celebratory badges, and habit momentum scoring.",
    phase4Title: "AI Motivation Coach Integration",
    phase4Desc: "Empathetic coaching prompt generation offering routine recovery plans after missed days.",
    actions: [
      {
        action: "Scaffold Next.js 14 project with TypeScript and Tailwind",
        detail: "Initialize project directory and establish base types for Habit, CompletionLog, and StreakMetrics.",
      },
      {
        action: "Build mock Habit card component with interactive checkmark pill",
        detail: "Create an accessible, tactile completion button with optimistic state and micro-sound feedback.",
      },
      {
        action: "Implement add habit form with local state",
        detail: "Allow typing a habit name, selecting an icon category, and saving to the active list.",
      },
      {
        action: "Connect browser localStorage for zero-database persistence",
        detail: "Verify adding a habit, marking complete, and refreshing page maintains exact state.",
      },
    ],
    agentTips: [
      "Always ask your coding agent to implement one small verifiable slice at a time.",
      "Never allow the agent to edit more than 2 files per prompt before verifying the change.",
      "Keep types strictly defined in a dedicated types/ file so the agent adheres to strict boundaries.",
      "When a bug occurs, paste the terminal error directly into the agent prompt with the exact line number.",
    ],
  },

  ai_tool: {
    titlePrefix: "AI Companion Tool",
    defaultTitle: "AI-Powered Productivity Assistant",
    stack: [
      {
        category: "Framework",
        name: "Next.js 14 App Router",
        reason: "Full-stack serverless routes for securing API keys and streaming real-time responses.",
      },
      {
        category: "AI Integration",
        name: "Google Gemini 1.5 Flash API (or Vercel AI SDK)",
        reason: "High-speed responses with low latency and generous free tier for hackathon prototypes.",
      },
      {
        category: "Styling",
        name: "Tailwind CSS",
        reason: "Modern conversational UI, markdown formatting, and shimmering loading skeletons.",
      },
      {
        category: "Storage",
        name: "LocalStorage with Serverless Fallback",
        reason: "Guaranteed offline demo stability even if API keys or quota limits fail.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Google AI Gemini API Quickstart",
        url: "https://ai.google.dev/docs/gemini_api_overview",
      },
      {
        type: "SDK Documentation",
        title: "Vercel AI SDK Streaming Guide",
        url: "https://sdk.vercel.ai/docs",
      },
      {
        type: "Interactive Reference",
        title: "Next.js Route Handlers for AI Endpoints",
        url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
      },
    ],
    phase1Title: "Prompt Input Studio & Offline Fallback",
    phase1Desc: "Build the clean prompt input area, preset chips, loading states, and offline heuristic response engine.",
    phase2Title: "API Route Handler & Secure Key Integration",
    phase2Desc: "Create server-side Next.js route handler /api/generate with 8-second timeout and automatic fallback.",
    phase3Title: "Structured Markdown Output & 1-Click Copy",
    phase3Desc: "Render AI responses in clean typography with syntax-highlighted code blocks and clipboard actions.",
    phase4Title: "Prompt History & Export to Markdown",
    phase4Desc: "Store past generated prompts in a history drawer and allow one-click export to notes.",
    actions: [
      {
        action: "Build prompt console with preset prompts and character validator",
        detail: "Create responsive textarea with character counter and disable submit when under 10 chars.",
      },
      {
        action: "Implement shimmering SkeletonLoader during response generation",
        detail: "Provide smooth perceptual loading state so UI never feels frozen.",
      },
      {
        action: "Build /api/generate Route Handler with robust error catching",
        detail: "Wrap API call in try/catch and return heuristic fallback if key is missing or quota is exceeded.",
      },
      {
        action: "Test with and without API key to verify zero demo failure",
        detail: "Confirm the app remains 100% usable whether online with credentials or totally offline.",
      },
    ],
    agentTips: [
      "Tell the agent: 'Always keep API keys strictly in server routes; never expose them to client components.'",
      "Always require a graceful fallback engine so the demo never hangs if the network drops.",
      "Instruct the agent to stream or use optimistic loaders to keep perceived latency near zero.",
      "Validate API output schema to prevent broken UI renders on unexpected model outputs.",
    ],
  },

  ecommerce: {
    titlePrefix: "E-Commerce",
    defaultTitle: "Curated Store & Checkout Experience",
    stack: [
      {
        category: "Framework",
        name: "Next.js 14 App Router",
        reason: "Server-side product listing generation, fast client cart state, and easy deployment.",
      },
      {
        category: "Styling",
        name: "Tailwind CSS",
        reason: "Clean product cards, sticky slide-out cart drawer, and high-contrast checkout forms.",
      },
      {
        category: "Cart State",
        name: "Zustand (or React Context + LocalStorage)",
        reason: "Lightweight reactive cart state synchronized with localStorage across browser reloads.",
      },
      {
        category: "Payments Mock",
        name: "Mock Stripe Elements Flow",
        reason: "Realistic checkout experience and confirmation page without live banking configuration.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Next.js App Router Documentation",
        url: "https://nextjs.org/docs",
      },
      {
        type: "Design Guide",
        title: "Tailwind CSS E-Commerce UI Components",
        url: "https://tailwindui.com/components/ecommerce",
      },
      {
        type: "State Management",
        title: "Zustand State Management Quickstart",
        url: "https://github.com/pmndrs/zustand",
      },
    ],
    phase1Title: "Product Catalog Grid & Category Filter",
    phase1Desc: "Render product cards with images, badges, price formatting, and instant category tab filtering.",
    phase2Title: "Interactive Cart Drawer & Quantity Controls",
    phase2Desc: "Slide-out cart drawer with item count pill, increment/decrement controls, subtotal, and tax math.",
    phase3Title: "Checkout Form with Field Validation",
    phase3Desc: "Clean 2-step checkout (shipping address and mock payment card) with strict field validation.",
    phase4Title: "Order Success Receipt & LocalStorage Persistence",
    phase4Desc: "Display simulated confirmation receipt with order number, itemized summary, and clear-cart action.",
    actions: [
      {
        action: "Define Product and CartItem types in types/store.ts",
        detail: "Include id, title, price, category, rating, image, and quantity.",
      },
      {
        action: "Build ProductCard component with 'Add to Cart' animation",
        detail: "Provide immediate tactile feedback when an item is added to the cart.",
      },
      {
        action: "Implement slide-out CartDrawer with subtotal calculation",
        detail: "Ensure clicking outside or the close button smoothly dismisses the drawer.",
      },
      {
        action: "Persist cart contents in localStorage",
        detail: "Verify refreshing the browser preserves all active items and quantities in the cart.",
      },
    ],
    agentTips: [
      "Tell the agent: 'Represent all monetary values as integer cents internally to avoid JavaScript floating point errors.'",
      "Avoid heavy e-commerce backend dependencies for Phase 1; mock product items in a local JSON file.",
      "Instruct the agent to add optimistic UI updates when clicking Add to Cart for instant responsiveness.",
      "Ensure the checkout form has clear visual inline validation errors before submission.",
    ],
  },

  general_web: {
    titlePrefix: "Web App",
    defaultTitle: "Modern Web Application",
    stack: [
      {
        category: "Framework",
        name: "Next.js 14 App Router",
        reason: "Modern React architecture with server and client components, fast routing, and Vercel hosting.",
      },
      {
        category: "Styling",
        name: "Tailwind CSS",
        reason: "Utility-first design with clean spacing, responsive layouts, and zero CSS runtime overhead.",
      },
      {
        category: "Language",
        name: "TypeScript",
        reason: "Strict type safety preventing runtime crashes and enabling clear agent prompt contracts.",
      },
      {
        category: "Storage",
        name: "Browser LocalStorage (Zero-Database Prototype)",
        reason: "Immediate, reliable data persistence with zero backend infrastructure requirements.",
      },
    ],
    resources: [
      {
        type: "Official Docs",
        title: "Next.js App Router Documentation",
        url: "https://nextjs.org/docs",
      },
      {
        type: "Styling Reference",
        title: "Tailwind CSS Utility & Layout Documentation",
        url: "https://tailwindcss.com/docs",
      },
      {
        type: "Best Practices",
        title: "MDN Web Development Standards & Best Practices",
        url: "https://developer.mozilla.org/en-US/docs/Learn",
      },
    ],
    phase1Title: "Core Layout & Single-User Proof of Concept",
    phase1Desc: "Build the foundational layout, primary view, interactive input form, and test basic state changes.",
    phase2Title: "Interactive Features & State Persistence",
    phase2Desc: "Wire event handlers, connect local storage to preserve state across reloads, and handle validation.",
    phase3Title: "Feedback States & Responsive Polish",
    phase3Desc: "Add empty states, toast alerts, loading indicators, and ensure clean layout across mobile and desktop.",
    phase4Title: "Production Hardening & Demo Preparation",
    phase4Desc: "Test edge cases, audit accessibility, clean unused code, and verify smooth end-to-end demo flow.",
    actions: [
      {
        action: "Define core domain interfaces in types/index.ts",
        detail: "Establish explicit data contracts before building components.",
      },
      {
        action: "Build main dashboard view with responsive header and container",
        detail: "Create clean, modern layout following the approved design system.",
      },
      {
        action: "Implement primary interactive feature with local React state",
        detail: "Test adding, updating, and viewing primary domain items.",
      },
      {
        action: "Connect browser localStorage for zero-database persistence",
        detail: "Verify state survives page refresh with no backend or login wall required.",
      },
    ],
    agentTips: [
      "Ask your coding agent to implement one small verifiable slice at a time.",
      "Never allow the agent to edit more than 2 files per prompt before verifying the change.",
      "Keep types strictly defined in a dedicated types/ file so the agent adheres to strict boundaries.",
      "When a bug occurs, paste the terminal error directly into the agent prompt with the exact line number.",
    ],
  },
};

/**
 * Detect the most appropriate project category from user input.
 */
function detectCategory(text: string): ProjectCategory {
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
 * Extract or synthesize a clean project title from the user's idea text.
 */
function extractTitle(text: string, category: ProjectCategory): string {
  // Strip common conversational openings
  let clean = text
    .replace(/^i want to build (an? )?/i, "")
    .replace(/^i need (an? )?/i, "")
    .replace(/^a simple /i, "")
    .replace(/^a minimal /i, "")
    .replace(/^an? /i, "")
    .trim();

  // Take the first clause up to punctuation or connective words
  const clause = clean.split(/[.,;\n]| with | that | for | featuring | where /i)[0].trim();

  if (clause.length >= 5 && clause.length <= 48) {
    // Title case the clause
    return clause
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return TEMPLATES[category].defaultTitle;
}

/**
 * Generate a concise 1-2 sentence summary of the project scope.
 */
function generateSummary(text: string, title: string, category: ProjectCategory): string {
  const trimmed = text.trim();
  if (trimmed.length > 30 && trimmed.length < 220 && !trimmed.toLowerCase().startsWith("i want to")) {
    return trimmed;
  }

  const categoryDescriptions: Record<ProjectCategory, string> = {
    extension: `A focused browser extension that streamlines your workflow on active web pages with zero-latency local storage.`,
    mobile: `A touch-first mobile application providing intuitive interactions and offline storage designed for quick daily use.`,
    scraper: `An automated data collector and dashboard that gathers target records, eliminates duplicates, and organizes them in a searchable digest.`,
    bot: `An event-driven bot that automates notifications and responds to user commands with formatted embed cards.`,
    cli: `A high-performance command-line utility with interactive prompts, visual spinners, and cross-platform terminal support.`,
    flashcards: `A minimal spaced repetition flashcard studio with interactive card flips and Leitner box scheduling to master new concepts faster.`,
    finance: `A privacy-first personal finance tracker with zero-cloud storage, category breakdowns, and visual expense insights.`,
    habit: `A friction-free habit tracker featuring streak momentum metrics, tactile checkmarks, and offline-first local storage.`,
    ai_tool: `A clean AI companion tool combining structured prompt presets, fast responses, and reliable offline fallbacks.`,
    ecommerce: `A modern e-commerce storefront with category filtering, responsive cart drawer, and frictionless checkout flow.`,
    general_web: `A single-page web application featuring responsive design, tactile interactions, and zero-database local persistence.`,
  };

  return `${title}: ${categoryDescriptions[category]}`;
}

/**
 * Generate a complete, tailor-made IdeaBlueprint from raw user input.
 */
export function generateBlueprint(ideaText: string): IdeaBlueprint {
  const category = detectCategory(ideaText);
  const template = TEMPLATES[category];
  const projectTitle = extractTitle(ideaText, category);
  const summary = generateSummary(ideaText, projectTitle, category);

  const roadmap: BlueprintPhase[] = [
    {
      phase: "Phase 1",
      title: template.phase1Title,
      description: template.phase1Desc,
    },
    {
      phase: "Phase 2",
      title: template.phase2Title,
      description: template.phase2Desc,
    },
    {
      phase: "Phase 3",
      title: template.phase3Title,
      description: template.phase3Desc,
    },
    {
      phase: "Phase 4",
      title: template.phase4Title,
      description: template.phase4Desc,
    },
  ];

  const nextActions: NextAction[] = template.actions.map((act, index) => ({
    step: index + 1,
    action: act.action,
    detail: act.detail,
  }));

  const primaryTech = template.stack[0]?.name || "Next.js 14";
  const stylingTech = template.stack[1]?.name || "Tailwind CSS";

  const firstPrompt = `I am building ${projectTitle} using ${primaryTech} and ${stylingTech}.

PROJECT SUMMARY:
${summary}

PHASE 1 SCOPE:
${template.phase1Desc}

IMMEDIATE STEPS:
1. ${nextActions[0].action}
2. ${nextActions[1].action}
3. ${nextActions[2].action}
4. ${nextActions[3].action}

Please write complete, self-contained code with zero placeholders. Start with Step 1 by establishing the project types and baseline structure.`;

  return {
    projectTitle,
    summary,
    roadmap,
    nextActions,
    techStack: template.stack,
    resources: template.resources,
    agentGuide: {
      workflowTips: template.agentTips,
      firstPrompt,
    },
    isFallback: true,
  };
}
