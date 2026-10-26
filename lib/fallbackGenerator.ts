import {
  IdeaBlueprint,
  BlueprintPhase,
  NextAction,
  StackItem,
  ResourceItem,
  PitfallItem,
  ClarifyingQuestion,
  RoadmapNode,
  ProjectArchitecture,
  ProjectType,
  ProjectPart,
  RecommendedStack,
} from "@/types/blueprint";
import { retrieveKnowledge, buildRoadmapNodes } from "@/lib/knowledgeBank";
import {
  validateAndRepairBlueprint,
  validateAndRepairArchitecture,
} from "@/lib/validateBlueprint";
import { createExtensionStarterArtifacts } from "@/lib/artifactVerifier";

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
  | "agriculture"
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
    lower.includes("npm package") ||
    lower.includes("csv")
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

  if (
    lower.includes("farm") ||
    lower.includes("crop") ||
    lower.includes("plant") ||
    lower.includes("rainfall") ||
    lower.includes("rain ") ||
    lower.includes("weather") ||
    lower.includes("soil") ||
    lower.includes("irrigation") ||
    lower.includes("harvest") ||
    lower.includes("agriculture") ||
    lower.includes("agritech")
  ) {
    return "agriculture";
  }

  return "general_web";
}

/**
 * Return 2-3 tailored architectural questions to sharpen the project strategy.
 */
export function getClarifyingQuestions(ideaText: string): ClarifyingQuestion[] {
  const category = detectCategory(ideaText);

  const baseQuestions: ClarifyingQuestion[] = [
    {
      id: "coding_style",
      title: "Will you write code yourself, or build mainly by directing an AI coding agent (vibe coding)?",
      helper: "Drives whether your curriculum is an agile 'vibe-coder' minimum or a deeper code-along.",
      options: [
        {
          id: "vibe",
          label: "Mostly AI agent (Vibe coding)",
          recommendation: true,
        },
        {
          id: "mix",
          label: "Mix (directing AI with manual coding)",
        },
        {
          id: "myself",
          label: "Mostly myself (learn deep mechanics)",
        },
      ],
    },
    {
      id: "experience_level",
      title: "What is your programming experience level?",
      helper: "Calibrates how simple our explanations and analogies are so you never feel lost.",
      options: [
        {
          id: "none",
          label: "Never coded",
          recommendation: true,
        },
        {
          id: "beginner",
          label: "Know a little",
        },
        {
          id: "intermediate",
          label: "Build already",
        },
      ],
    },
    {
      id: "time_budget",
      title: "How much time do you have available?",
      helper: "Sizes your milestone cutline and foundations so you finish comfortably before demo day.",
      options: [
        {
          id: "standard",
          label: "2 hours / day for 7 days (~14 hours total)",
          recommendation: true,
        },
        {
          id: "weekend",
          label: "Weekend focused sprint (12–16 hours over 2 days)",
        },
        {
          id: "light",
          label: "1 hour / day for 5 days (~5 hours total)",
        },
      ],
    },
  ];

  let projectQuestion: ClarifyingQuestion;
  if (category === "cli") {
    projectQuestion = {
      id: "cli_input",
      title: "How will users supply input to your CLI tool?",
      helper: "Focuses the Phase 1 MVP parsing requirements.",
      options: [
        {
          id: "interactive_flags",
          label: "Terminal flags or interactive prompts",
          recommendation: true,
        },
        {
          id: "piped_input",
          label: "Piping raw text streams directly from standard input",
        },
      ],
    };
  } else if (category === "extension") {
    projectQuestion = {
      id: "extension_mode",
      title: "How will users interact with the extension?",
      helper: "Defines the core Chrome Manifest entrypoint.",
      options: [
        {
          id: "popup",
          label: "Toolbar icon click opens clean popup window (360x480px)",
          recommendation: true,
        },
        {
          id: "floating_overlay",
          label: "Injected floating badge/sidebar directly inside web pages",
        },
      ],
    };
  } else {
    projectQuestion = {
      id: "mvp_storage",
      title: "Where should your MVP store user data during testing?",
      helper: "Zero-database local storage eliminates setup friction for demo day.",
      options: [
        {
          id: "local_storage",
          label: "Browser LocalStorage (Zero backend setup required)",
          recommendation: true,
        },
        {
          id: "local_json_file",
          label: "A simple local JSON file on disk",
        },
        {
          id: "cloud_database",
          label: "Cloud database with user accounts (Deferred to Level Up Later)",
        },
      ],
    };
  }

  return [...baseQuestions, projectQuestion];
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
          whyItHappens: "Expecting new testers to manually type in 10 questions before testing.",
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

    case "agriculture":
      return [
        {
          trap: "Assuming simple rainfall amounts equate to soil moisture without soil type context",
          whyItHappens: "Sandy soils drain quickly while clay retains moisture; raw rainfall figures alone can mislead planting dates.",
          howToAvoid: "Clearly display an explicit disclaimer in the UI that advice is advisory and requires local agronomic validation.",
        },
        {
          trap: "Relying strictly on real-time internet weather APIs in rural farming areas with spotty connectivity",
          whyItHappens: "Live API requests fail or time out when tested in rural field conditions.",
          howToAvoid: "Seed baseline local historical averages and provide manual rainfall logging that persists 100% offline in LocalStorage.",
        },
        {
          trap: "Recommending uniform planting dates across diverse microclimates within Rivers State",
          whyItHappens: "Coastal riverine LGAs have different precipitation patterns than upland zones.",
          howToAvoid: "Structure the zone selector by LGA / agricultural zone so thresholds are localized rather than state-wide generalizations.",
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
 * Fallback architecture generator producing 3-7 domain-tailored parts,
 * sensible recommended stack with plain English rationale & alternatives,
 * and clear front-end vs back-end explanation for ANY idea.
 */
export function generateFallbackArchitecture(
  ideaText: string,
  userChoices: Record<string, string> = {}
): ProjectArchitecture {
  const category = detectCategory(ideaText);
  const lower = ideaText.toLowerCase();

  if (category === "bot") {
    return {
      project_type: "bot",
      front_back_explained_simply:
        "For a bot, the FRONT END is what users see and interact with in the chat app (Discord, Slack, or Telegram)—slash commands, autocomplete options, and rich card embeds. The BACK END is the bot script running behind the scenes on your computer or cloud server that connects to the Discord gateway API, calculates dates/reminders, and saves data to disk.",
      recommended_stack: {
        language: "JavaScript / TypeScript (Node.js)",
        framework_or_tools: ["discord.js", "node-cron", "dotenv"],
        why_in_plain_english:
          "Node.js with discord.js has the largest beginner documentation, active community help, and handles live event streams asynchronously without server crashes.",
        alternatives: [
          {
            name: "Python with discord.py",
            pick_this_if: "You already know Python or want to run data/math scripts",
          },
          {
            name: "Grammy / Telegraf",
            pick_this_if: "You prefer building for Telegram instead of Discord",
          },
        ],
      },
      parts: [
        {
          id: "bot-gateway-client",
          name: "Bot Connection & Environment Config",
          one_line_purpose:
            "Authenticates with Discord's API gateway using a secret bot token and keeps the bot online.",
          side: "back end (works behind the scenes)",
          depends_on: [],
          example_look_feel_function:
            "When started, your terminal logs 'Logged in as DeadlineBot#1001' and the bot turns green (online) in your Discord server member list.",
          steps: [
            "Create application in Discord Developer Portal and copy token",
            "Create .env file with DISCORD_TOKEN",
            "Run client.login() listener to verify connection",
          ],
          resources: [
            {
              title: "Discord.js Official Guide",
              url: "https://discordjs.guide/",
              why: "Step-by-step beginner walk-through from bot creation to first message.",
            },
          ],
        },
        {
          id: "slash-commands",
          name: "Interactive Slash Commands & Embeds",
          one_line_purpose:
            "Registers chat commands like /remind that show popup inputs and styled message cards.",
          side: "front end (what the user sees)",
          depends_on: ["bot-gateway-client"],
          example_look_feel_function:
            "A student types '/deadline add subject:Physics due:tomorrow' in chat; the bot replies with a vibrant blue embed card with a calendar badge.",
          steps: [
            "Define SlashCommandBuilder schema",
            "Register slash commands with Discord REST API",
            "Handle client.on('interactionCreate')",
          ],
          resources: [
            {
              title: "Discord Slash Commands Guide",
              url: "https://discordjs.guide/slash-commands/response-methods.html",
              why: "Clear examples of rich embed styling and ephemeral messages.",
            },
          ],
        },
        {
          id: "reminder-scheduler",
          name: "Cron Scheduler & Notification Dispatcher",
          one_line_purpose:
            "Monitors upcoming deadlines every minute and posts automated alert pings when assignments are due.",
          side: "back end (works behind the scenes)",
          depends_on: ["slash-commands"],
          example_look_feel_function:
            "At 9:00 AM, the bot pings @student: '⚠️ Heads up: Physics Problem Set 3 is due in 3 hours!' in their channel.",
          steps: [
            "Install node-cron",
            "Create a 1-minute interval checker loop",
            "Send alert message to specified channel ID",
          ],
          resources: [
            {
              title: "node-cron Documentation",
              url: "https://www.npmjs.com/package/node-cron",
              why: "Simple syntax for recurring schedules (every minute, daily at 9am).",
            },
          ],
        },
        {
          id: "local-storage-json",
          name: "Local JSON File Persistence",
          one_line_purpose:
            "Saves deadlines to a local deadlines.json file so alerts survive bot restarts.",
          side: "back end (works behind the scenes)",
          depends_on: ["bot-gateway-client"],
          example_look_feel_function:
            "A clean deadlines.json file on your disk holding arrays of deadline objects with user IDs, timestamps, and course titles.",
          steps: [
            "Write saveDeadlines(items) helper using fs.writeFileSync",
            "Write loadDeadlines() with try/catch fallback",
            "Test saving and reloading an item",
          ],
          resources: [
            {
              title: "Node.js File System (fs) Guide",
              url: "https://nodejs.org/api/fs.html",
              why: "Shows how to read and write local files with zero database setup.",
            },
          ],
        },
      ],
      finished_product_preview:
        "A living Discord bot in your study server. Students type '/deadline add' to track assignments, '/deadline list' to see a countdown table, and receive timely direct alerts before things are due.",
    };
  }

  if (category === "cli") {
    return {
      project_type: "CLI",
      front_back_explained_simply:
        "For a command-line tool, the FRONT END is what you see in the terminal: colored status text, interactive arrow-key selection menus, and formatted ASCII tables. The BACK END is the script logic running behind the scenes: reading raw files from your disk, validating data, performing math calculations, and writing outputs.",
      recommended_stack: {
        language: "Node.js (JavaScript) or Python",
        framework_or_tools: ["commander", "csv-parser", "picocolors", "cli-table3"],
        why_in_plain_english:
          "Commander parses terminal flags effortlessly, csv-parser processes megabytes of data in milliseconds, and picocolors adds vibrant terminal colors with zero runtime overhead.",
        alternatives: [
          {
            name: "Python with Typer & Pandas",
            pick_this_if: "You already know Python or need heavy mathematical/statistical analysis",
          },
          {
            name: "Go with Cobra",
            pick_this_if: "You want a single compiled binary executable to distribute without runtime dependencies",
          },
        ],
      },
      parts: [
        {
          id: "csv-stream-reader",
          name: "Bank CSV Ingestion & Header Normalizer",
          one_line_purpose:
            "Reads raw bank export files from your computer and standardizes inconsistent date, currency, and description formats.",
          side: "back end (works behind the scenes)",
          depends_on: [],
          example_look_feel_function:
            "Reads 'statement.csv' containing messy columns and extracts clean rows with amountInCents, date, and description.",
          steps: [
            "Install csv-parser",
            "Create readable stream with fs.createReadStream",
            "Normalize dates to YYYY-MM-DD and money to integer cents",
          ],
          resources: [
            {
              title: "csv-parser GitHub Guide",
              url: "https://www.npmjs.com/package/csv-parser",
              why: "Blazing fast CSV parsing examples for Node.js.",
            },
          ],
        },
        {
          id: "budget-aggregator",
          name: "Category Aggregator & Budget Calculator",
          one_line_purpose:
            "Categorizes transactions (Groceries, Utilities, Subscriptions) and calculates spending vs budget.",
          side: "back end (works behind the scenes)",
          depends_on: ["csv-stream-reader"],
          example_look_feel_function:
            "Calculates total spending ($1,240.50), identifies your largest recurring charges, and calculates remaining budget.",
          steps: [
            "Create category keyword mapping dictionary",
            "Aggregate total spend per category",
            "Compare totals against monthly target limits",
          ],
          resources: [
            {
              title: "JavaScript Array Reducer Patterns",
              url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce",
              why: "The cleanest way to group and sum transactions without third-party libraries.",
            },
          ],
        },
        {
          id: "terminal-cli-interface",
          name: "Command Flags & Interactive Prompts",
          one_line_purpose:
            "Provides friendly commands like 'finance import <file>' and interactive arrow-key selection menus.",
          side: "front end (what the user sees)",
          depends_on: [],
          example_look_feel_function:
            "Running `finance` displays: '? Select report: › Monthly Spending / Category Breakdown / Set Budget'",
          steps: [
            "Configure Commander CLI options",
            "Add interactive prompt using Inquirer or prompts",
            "Add helpful --help manual page",
          ],
          resources: [
            {
              title: "Commander.js Guide",
              url: "https://www.npmjs.com/package/commander",
              why: "The standard tool for building modern Node.js command-line interfaces.",
            },
          ],
        },
        {
          id: "ascii-report-table",
          name: "Colorized ASCII Summary Table & Charts",
          one_line_purpose:
            "Prints clear, beautifully formatted tables and text-based progress bars directly in the terminal.",
          side: "front end (what the user sees)",
          depends_on: ["budget-aggregator", "terminal-cli-interface"],
          example_look_feel_function:
            "Prints a box-drawn border table: '┌ Groceries │ $340 / $400 │ [████████░░] 85% ┐' with green/red status colors.",
          steps: [
            "Install cli-table3 and picocolors",
            "Format rows with colored currency strings",
            "Render progress bar string",
          ],
          resources: [
            {
              title: "cli-table3 Examples",
              url: "https://www.npmjs.com/package/cli-table3",
              why: "Makes clean Unicode/ASCII tables in terminal stdout.",
            },
          ],
        },
      ],
      finished_product_preview:
        "A fast local terminal utility you run with 'finance check'. It parses your downloaded bank CSVs locally with 100% privacy, highlights where your money went, and shows budget health in formatted ASCII tables.",
    };
  }

  if (category === "mobile") {
    return {
      project_type: "mobile app",
      front_back_explained_simply:
        "For a mobile app, the FRONT END is the touch interface displayed on your smartphone screen (buttons, lists, modals, and gestures) built with React Native. The BACK END is the local offline storage (AsyncStorage) that saves your data on the device without requiring cloud databases.",
      recommended_stack: {
        language: "TypeScript / JavaScript",
        framework_or_tools: ["React Native", "Expo", "Expo Router", "AsyncStorage"],
        why_in_plain_english:
          "Expo allows you to test your mobile app on your actual phone in seconds via QR code, bypassing Xcode and Android Studio setup entirely.",
        alternatives: [
          {
            name: "Flutter",
            pick_this_if: "You prefer Dart or want pixel-perfect custom canvas rendering across platforms",
          },
          {
            name: "PWA (Mobile Web)",
            pick_this_if: "You want a web URL that users can add to their phone home screen without native apps",
          },
        ],
      },
      parts: [
        {
          id: "mobile-screen-view",
          name: "Touch-First Screen Layout & Navigation",
          one_line_purpose: "Displays the primary mobile view with finger-friendly buttons and screen headers.",
          side: "front end (what the user sees)",
          depends_on: [],
          example_look_feel_function: "A smooth mobile screen with pull-to-refresh and large touch cards.",
          steps: ["Scaffold screen in app/index.tsx", "Use <View> and <Text> primitives", "Add <Pressable> feedback"],
        },
        {
          id: "mobile-storage",
          name: "Offline Device Storage Layer",
          one_line_purpose: "Saves user data securely on the phone using AsyncStorage.",
          side: "back end (works behind the scenes)",
          depends_on: ["mobile-screen-view"],
          example_look_feel_function: "Closing the mobile app and reopening it restores all your saved entries immediately.",
          steps: ["Install @react-native-async-storage/async-storage", "Write get/set helpers", "Handle JSON parsing safely"],
        },
        {
          id: "gesture-haptics",
          name: "Touch Interactions & Haptic Feedback",
          one_line_purpose: "Triggers gentle vibrations and swipe gestures when completing actions.",
          side: "front end (what the user sees)",
          depends_on: ["mobile-screen-view"],
          example_look_feel_function: "Swiping an item right triggers a gentle phone buzz and marks it complete.",
          steps: ["Install expo-haptics", "Add Haptics.impactAsync on button press", "Add swipe gesture handler"],
        },
      ],
      finished_product_preview:
        "A snappy mobile app installed on your smartphone via Expo Go. You interact with tactile touch controls, swipe to mark progress, and enjoy 100% offline reliability.",
    };
  }

  if (category === "scraper") {
    return {
      project_type: "data/script",
      front_back_explained_simply:
        "For a data script or scraper, the FRONT END is the user output—either a clean terminal status feed, an exported CSV/JSON spreadsheet, or a minimal web digest table. The BACK END is the extraction engine that fetches pages, parses HTML tags, cleans text, and removes duplicate records.",
      recommended_stack: {
        language: "JavaScript (Node.js) or Python",
        framework_or_tools: ["Cheerio", "Node Fetch", "SQLite / JSON"],
        why_in_plain_english:
          "Cheerio parses HTML like jQuery in milliseconds without needing to launch heavy, slow browser engines.",
        alternatives: [
          {
            name: "Playwright",
            pick_this_if: "Target websites require heavy JavaScript execution or clicking before data appears",
          },
          {
            name: "Python with BeautifulSoup",
            pick_this_if: "You are building a Python data science or pandas workflow",
          },
        ],
      },
      parts: [
        {
          id: "html-parser-engine",
          name: "HTML Fetcher & DOM Extraction Engine",
          one_line_purpose: "Requests target pages and uses CSS selectors to extract title, date, and link fields.",
          side: "back end (works behind the scenes)",
          depends_on: [],
          example_look_feel_function: "Extracts 25 upcoming tech meetups from a city calendar with zero duplicate records.",
          steps: ["Fetch page HTML via fetch()", "Load Cheerio instance with $.load(html)", "Query target elements and map to array"],
        },
        {
          id: "dedup-storage",
          name: "Deduplication & Local Store",
          one_line_purpose: "Hashes records to prevent recording the same event multiple times.",
          side: "back end (works behind the scenes)",
          depends_on: ["html-parser-engine"],
          example_look_feel_function: "Generates an events.json file on disk containing clean, normalized records.",
          steps: ["Generate unique hash per record", "Filter existing hashes", "Write new items to disk"],
        },
        {
          id: "output-digest",
          name: "Digest Presentation & CSV Export",
          one_line_purpose: "Presents extracted records in a readable terminal summary and exports clean CSVs.",
          side: "front end (what the user sees)",
          depends_on: ["dedup-storage"],
          example_look_feel_function: "Outputs a clean terminal digest with clickable links and creates a download ready events.csv.",
          steps: ["Format summary console log", "Write exportToCsv helper", "Add manual refresh trigger"],
        },
      ],
      finished_product_preview:
        "A reliable automated data collector you run on demand. It aggregates target events or listings, cleans up duplicates, and outputs an organized digest with direct links.",
    };
  }

  if (category === "agriculture") {
    return {
      project_type: "web app",
      front_back_explained_simply:
        "For an agricultural advisory app, the FRONT END is what the farmer or extension worker sees—zone and crop selection controls, rainfall history cards, and color-coded planting readiness badges. The BACK END is the rule calculation engine that compares cumulative rainfall against crop moisture requirements, plus local offline storage so advisory data remains accessible in rural areas with spotty internet.",
      recommended_stack: {
        language: "TypeScript / JavaScript",
        framework_or_tools: ["Next.js (React)", "Tailwind CSS", "Lucide Icons"],
        why_in_plain_english:
          "Next.js gives you a fast responsive dashboard, React handles instant planting calculation updates when rainfall numbers change, and Tailwind keeps weather cards readable in direct sunlight.",
        alternatives: [
          {
            name: "Python (Streamlit / Flask)",
            pick_this_if: "You want to process large historical rainfall datasets or run agronomic Python models",
          },
          {
            name: "React Native (Expo Mobile)",
            pick_this_if: "You want a dedicated mobile app that farmers can carry into fields offline",
          },
        ],
      },
      parts: [
        {
          id: "rainfall-data-input",
          name: "Rainfall Observation & Zone Selector",
          one_line_purpose:
            "Allows the user to select their local agricultural zone (e.g. Rivers State LGA) and record recent rainfall levels or weather forecasts.",
          side: "front end (what the user sees)",
          depends_on: [],
          example_look_feel_function:
            "A clean dropdown to pick LGA / district and a slider or number input to enter weekly rainfall in millimeters, with preset historical defaults.",
          steps: [
            "Create location selector component with Rivers State agricultural zones",
            "Build numeric rainfall measurement input with millimeters unit badge",
            "Provide sample baseline rainfall presets for testing without live APIs",
          ],
          resources: [
            {
              title: "Open-Meteo Weather & Rainfall API",
              url: "https://open-meteo.com/en/docs",
              why: "Free open-source weather and precipitation data without API key requirements.",
            },
          ],
        },
        {
          id: "crop-calendar-engine",
          name: "Crop Water Rules & Planting Advisory Logic",
          one_line_purpose:
            "Evaluates cumulative rainfall against crop-specific moisture thresholds (e.g. cassava, maize, yam) to calculate planting readiness.",
          side: "back end (works behind the scenes)",
          depends_on: ["rainfall-data-input"],
          example_look_feel_function:
            "A rule evaluator that checks if cumulative 14-day rainfall exceeds 60mm before recommending maize sowing, or flags waterlogging risks.",
          steps: [
            "Define crop water requirement matrix (e.g., cassava, maize, vegetables)",
            "Write pure evaluatePlantingWindow(rainfallMm, cropType) decision function",
            "Add safety caveat banners emphasizing that advisory rules require validated agronomic verification",
          ],
          resources: [
            {
              title: "FAO Crop Water Information",
              url: "https://www.fao.org/land-water/databases-and-software/crop-information/en/",
              why: "Authoritative United Nations Food and Agriculture Organization agronomic guidelines.",
            },
          ],
        },
        {
          id: "advisory-dashboard-view",
          name: "Planting Readiness & Visual Advisory Cards",
          one_line_purpose:
            "Displays clear planting status badges ('Optimal to Plant', 'Wait for Rain', 'Excess Water Risk') and practical seasonal tips.",
          side: "front end (what the user sees)",
          depends_on: ["crop-calendar-engine"],
          example_look_feel_function:
            "A high-contrast card showing 'Maize: Favorable Planting Window' in emerald green, with next 7-day soil moisture forecast tips.",
          steps: [
            "Build recommendation status card with high-contrast indicator badges",
            "Add plain-language explanation of why the recommendation was generated",
            "Display transparent disclaimer stating that local agronomic validation is required",
          ],
          resources: [
            {
              title: "Tailwind CSS Alert & Card Styling",
              url: "https://tailwindcss.com/docs/alerts",
              why: "Quick layout patterns for high-visibility field status indicators.",
            },
          ],
        },
        {
          id: "offline-field-storage",
          name: "Offline Rainfall Log & Farm Profile Cache",
          one_line_purpose:
            "Caches entered rainfall logs and crop selections locally so farmers can access advice offline in rural areas with spotty connectivity.",
          side: "back end (works behind the scenes)",
          depends_on: ["advisory-dashboard-view"],
          example_look_feel_function:
            "Saves entered rainfall logs into browser storage; reopening the app in the field instantly loads the latest advisory without internet.",
          steps: [
            "Create LocalStorage farmProfile cache helper with JSON serialization",
            "Add offline sync indicator showing 'Saved on this device'",
            "Include sample fixture data for Rivers State planting seasons",
          ],
          resources: [
            {
              title: "MDN Web Storage API",
              url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
              why: "Simple guide to browser-based offline data persistence.",
            },
          ],
        },
      ],
      finished_product_preview:
        "A field-ready advisory dashboard where farmers select their zone in Rivers State and crop, review local rainfall measurements, and receive actionable planting readiness advice with clear agronomic assumptions.",
    };
  }

  if (category === "extension") {
    const isSummarizer = lower.includes("summariz") || lower.includes("article");

    return {
      project_type: "web app",
      front_back_explained_simply:
        "For a Chrome extension, the FRONT END is what you see and interact with—the extension popup window (popup.html) when clicking the toolbar icon, plus content scripts injected into the webpage to read article text. The BACK END is the background service worker running behind the scenes to handle browser events and chrome.storage.local which saves your summaries offline.",
      recommended_stack: {
        language: "JavaScript / TypeScript (Chrome Extension MV3)",
        framework_or_tools: [
          "Chrome Manifest V3",
          "chrome.storage.local",
          "activeTab API",
          "Vanilla HTML/CSS",
        ],
        why_in_plain_english:
          "Manifest V3 is the modern Chrome extension standard with service worker background scripts and zero-build overhead for rapid local loading in developer mode.",
        alternatives: [
          {
            name: "Vite + CRXJS",
            pick_this_if: "You want React with hot module reload in your popup",
          },
          {
            name: "WebExtensions Polyfill",
            pick_this_if: "You plan to cross-publish to Firefox",
          },
        ],
      },
      parts: isSummarizer
        ? [
            {
              id: "manifest-config",
              name: "Manifest V3 Configuration & Permissions",
              one_line_purpose:
                "Declares activeTab and storage permissions, popup entrypoint, and background service worker registration.",
              side: "both",
              depends_on: [],
              example_look_feel_function:
                "A valid manifest.json file loaded into chrome://extensions with activeTab and storage permissions and zero syntax errors.",
              steps: [
                "Define manifest_version: 3 and extension metadata",
                "Declare 'activeTab' and 'storage' in permissions array",
                "Register default_popup in action object and background.service_worker",
              ],
              resources: [
                {
                  title: "Chrome Extension Manifest V3 Guide",
                  url: "https://developer.chrome.com/docs/extensions/mv3/getstarted/",
                  why: "Official beginner guide to Manifest V3 structure and permissions.",
                },
              ],
            },
            {
              id: "content-extractor",
              name: "Webpage Article Text Extractor (Content Script)",
              one_line_purpose:
                "Injects into the active webpage tab to extract readable article headline and body text from DOM elements.",
              side: "front end (what the user sees)",
              depends_on: ["manifest-config"],
              example_look_feel_function:
                "Runs in the context of the active article tab, grabs readable text from <article> or paragraph tags, and replies to extraction messages.",
              steps: [
                "Locate main article/content container elements in document DOM",
                "Extract and sanitize text content into clean paragraphs",
                "Listen for extraction requests from popup using chrome.runtime.onMessage",
              ],
              resources: [
                {
                  title: "Chrome Content Scripts Guide",
                  url: "https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts",
                  why: "Explains how content scripts run in isolated webpage contexts.",
                },
              ],
            },
            {
              id: "popup-ui",
              name: "Popup Summary Viewer & Action Trigger",
              one_line_purpose:
                "Provides a clean popup interface to trigger article summarization, view bullet-point highlights, and save summaries.",
              side: "front end (what the user sees)",
              depends_on: ["manifest-config", "content-extractor"],
              example_look_feel_function:
                "Clicking the toolbar icon displays a 360x480px popup with a 'Summarize Article' button, bulleted summary cards, and a 'Save for Later' button.",
              steps: [
                "Build popup.html structure with trigger button and summary output container",
                "Integrate summarization service helper (calling local Gemini Nano / window.ai or API) with fallback extractive bullet points",
                "Render concise bullet points with copy and save action buttons",
              ],
              resources: [
                {
                  title: "Design Extension Popups",
                  url: "https://developer.chrome.com/docs/extensions/develop/ui/action-popup",
                  why: "Guidance on popup layout, CSS styling, and responsive sizing.",
                },
              ],
            },
            {
              id: "storage-service-worker",
              name: "Service Worker & Saved Summaries Storage",
              one_line_purpose:
                "Coordinates background extension events and persists saved article summaries to chrome.storage.local for offline reading.",
              side: "back end (works behind the scenes)",
              depends_on: ["popup-ui"],
              example_look_feel_function:
                "Saved article summaries persist across browser sessions in chrome.storage.local, browseable in a 'Saved Summaries' tab with timestamps and delete buttons.",
              steps: [
                "Register background service worker in manifest.json",
                "Implement chrome.storage.local helper to save and load summary objects",
                "Display saved summaries list in popup with removal action",
              ],
              resources: [
                {
                  title: "Chrome Storage API Reference",
                  url: "https://developer.chrome.com/docs/extensions/reference/storage/",
                  why: "How to store and retrieve data asynchronously using chrome.storage.local.",
                },
              ],
            },
          ]
        : [
            {
              id: "manifest-config",
              name: "Manifest V3 Configuration & Permissions",
              one_line_purpose:
                "Declares extension permissions, toolbar action popup entrypoint, and background service worker.",
              side: "both",
              depends_on: [],
              example_look_feel_function:
                "A valid manifest.json file loaded into chrome://extensions with Developer mode enabled and zero configuration errors.",
              steps: [
                "Define manifest_version: 3 and extension metadata",
                "Declare required permissions in manifest.json",
                "Register action popup and background service worker",
              ],
              resources: [
                {
                  title: "Chrome Extension Manifest V3 Guide",
                  url: "https://developer.chrome.com/docs/extensions/mv3/getstarted/",
                  why: "Official beginner guide to Manifest V3 structure and permissions.",
                },
              ],
            },
            {
              id: "content-script",
              name: "Webpage DOM Content Script",
              one_line_purpose:
                "Interacts directly with the webpage DOM on the active browser tab.",
              side: "front end (what the user sees)",
              depends_on: ["manifest-config"],
              example_look_feel_function:
                "Injects into matching webpages to inspect or modify DOM elements in response to user actions.",
              steps: [
                "Query target DOM elements on the active page",
                "Execute page-level modifications or data extraction",
                "Listen for extension messages via chrome.runtime.onMessage",
              ],
              resources: [
                {
                  title: "Chrome Content Scripts Guide",
                  url: "https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts",
                  why: "Explains how content scripts run in isolated webpage contexts.",
                },
              ],
            },
            {
              id: "popup-ui",
              name: "Toolbar Action & Popup Controls",
              one_line_purpose:
                "Renders a compact toolbar popup window for toggles, user settings, and instant status triggers.",
              side: "front end (what the user sees)",
              depends_on: ["manifest-config"],
              example_look_feel_function:
                "Clicking the toolbar icon opens a clean 360x480px popup with interactive control toggles and status badges.",
              steps: [
                "Build popup.html structure with controls and status indicator",
                "Style with clean typography and high-contrast buttons",
                "Send user commands to content script and storage",
              ],
              resources: [
                {
                  title: "Design Extension Popups",
                  url: "https://developer.chrome.com/docs/extensions/develop/ui/action-popup",
                  why: "Guidance on popup layout, CSS styling, and responsive sizing.",
                },
              ],
            },
            {
              id: "storage-service-worker",
              name: "Background Service Worker & Local Storage",
              one_line_purpose:
                "Coordinates browser events and persists user preferences offline via chrome.storage.local.",
              side: "back end (works behind the scenes)",
              depends_on: ["popup-ui"],
              example_look_feel_function:
                "Extension settings and saved records persist across browser restarts without needing external databases.",
              steps: [
                "Register background service worker in manifest.json",
                "Implement chrome.storage.local get and set helpers",
                "Handle extension lifecycle events",
              ],
              resources: [
                {
                  title: "Chrome Storage API Reference",
                  url: "https://developer.chrome.com/docs/extensions/reference/storage/",
                  why: "How to store and retrieve data asynchronously using chrome.storage.local.",
                },
              ],
            },
          ],
      finished_product_preview: isSummarizer
        ? "A responsive Chrome extension installed in your browser toolbar. When reading any long article, click the extension icon to generate concise bullet-point summaries and save them to your local offline reading list."
        : "A responsive browser extension with toolbar popup, webpage DOM content script, and offline persistence via chrome.storage.local.",
    };
  }

  // Default Web App (Habit tracker, flashcards, ecommerce, general web)
  return {
    project_type: "web app",
    front_back_explained_simply:
      "For a web application, the FRONT END is the visual user interface in your browser—the interactive cards, buttons, progress bars, and animations built with HTML, CSS, and React. The BACK END is where your data is stored and calculated. For your MVP, browser LocalStorage acts as your offline back end so data persists across reloads without needing cloud servers.",
    recommended_stack: {
      language: "TypeScript / JavaScript",
      framework_or_tools: ["Next.js (React)", "Tailwind CSS", "Lucide Icons"],
      why_in_plain_english:
        "Next.js provides an instant local development server, React gives you responsive interactive state, and Tailwind makes styling clean without writing raw CSS.",
      alternatives: [
        {
          name: "Vite + React",
          pick_this_if: "You want a simpler single-page bundle without server-rendering concepts",
        },
        {
          name: "Vanilla HTML/CSS/JS",
          pick_this_if: "You want to learn core browser fundamentals before touching any framework",
        },
      ],
    },
    parts: [
      {
        id: "primary-interactive-view",
        name: "Interactive Cards & Action Controls",
        one_line_purpose:
          "Renders the main list of items with tactile toggle buttons and immediate visual feedback.",
        side: "front end (what the user sees)",
        depends_on: [],
        example_look_feel_function:
          "A clean card showing an item with a satisfying toggle circle that bounces and changes color when clicked.",
        steps: [
          "Scaffold ItemCard component",
          "Add onClick toggle handler",
          "Render list using array.map",
        ],
        resources: [
          {
            title: "React Component State Guide",
            url: "https://react.dev/learn/state-a-components-memory",
            why: "Explains how components remember and update user clicks.",
          },
        ],
      },
      {
        id: "state-calculation-engine",
        name: "Core Calculation & Progress Math Engine",
        one_line_purpose:
          "Performs the core domain calculations, progress percentages, and streak metrics.",
        side: "back end (works behind the scenes)",
        depends_on: ["primary-interactive-view"],
        example_look_feel_function:
          "Calculates that checking 4 out of 5 daily items equals 80% completion and updates the progress indicator.",
        steps: [
          "Write pure calculation helper function",
          "Add unit validation test",
          "Hook calculation into component state",
        ],
        resources: [
          {
            title: "JavaScript Array Methods (MDN)",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
            why: "Filter, map, and reduce fundamentals for fast state math.",
          },
        ],
      },
      {
        id: "local-storage-sync",
        name: "Browser LocalStorage Persistence Layer",
        one_line_purpose:
          "Saves state to browser memory so data survives page refreshes without needing a server.",
        side: "back end (works behind the scenes)",
        depends_on: ["primary-interactive-view"],
        example_look_feel_function:
          "When you reload or close the tab, all of your entries and progress stay exactly where you left them.",
        steps: [
          "Write custom useLocalStorage hook",
          "Load initial items on component mount",
          "Save serialized JSON when state updates",
        ],
        resources: [
          {
            title: "Window.localStorage Guide (MDN)",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
            why: "Explains local browser key-value storage with zero server needed.",
          },
        ],
      },
      {
        id: "micro-feedback-polish",
        name: "Tactile Feedback, Badges & Celebration Polish",
        one_line_purpose:
          "Adds rewarding animations, sound/toast feedback, and milestone celebration badges.",
        side: "front end (what the user sees)",
        depends_on: ["state-calculation-engine"],
        example_look_feel_function:
          "Completing your target triggers a toast notification with confetti animation and updates an achievement pill.",
        steps: [
          "Define milestone celebration triggers",
          "Add CSS micro-interaction animations",
          "Add clear empty state welcoming guidance",
        ],
        resources: [
          {
            title: "CSS Keyframe Animations Guide",
            url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations",
            why: "How to add rewarding tactile animations to web elements.",
          },
        ],
      },
    ],
    finished_product_preview:
      "A responsive web application that opens in your browser. You can add items, click tactile controls to mark progress, watch live counters update, and have your data persist locally without logging in.",
  };
}

/**
 * Generate a complete, tailor-made IdeaBlueprint from raw user input and user choices.
 */
/**
 * Extracts a clean, authentic, domain-relevant project title from user input,
 * preventing generic container nouns like "app" from wiping out the user's topic.
 */
export function extractProjectTitle(ideaText: string, category: ProjectCategory): string {
  if (!ideaText || typeof ideaText !== "string") return getFallbackTitle(category);

  // 1. Strip common conversational intros
  let clean = ideaText
    .replace(/^i want to build (an? )?/i, "")
    .replace(/^i want (an? )?/i, "")
    .replace(/^i need (an? )?/i, "")
    .replace(/^build (an? )?/i, "")
    .replace(/^create (an? )?/i, "")
    .replace(/^a simple /i, "")
    .replace(/^a minimal /i, "")
    .replace(/^an? /i, "")
    .trim();

  // 2. Check if clean starts with a generic container noun + relative connector (e.g. "app that tells...")
  const genericPrefixRegex = /^(?:app|application|tool|system|platform|website|web app|mobile app|script|program)\s+(?:that|which|to|for)\s+(.+)/i;
  const genericMatch = clean.match(genericPrefixRegex);

  let candidateText = clean;
  if (genericMatch && genericMatch[1]) {
    candidateText = genericMatch[1].trim();
    // Strip common leading action verbs
    candidateText = candidateText.replace(/^(?:tells?|helps?|reminds?|allows?|enables?|guides?|teaches?|tracks?)\s+/i, "");
  }

  // 3. Extract the primary clause before sentence ends or secondary clauses
  let clause = candidateText.split(/[.,;\n]|(?:\s+(?:featuring|where)\s+)/i)[0].trim();

  // If clause still has " that " or " with " or " for ", see if the prefix is descriptive
  const splitSub = clause.split(/\s+(?:that|with|for)\s+/i);
  const firstSub = splitSub[0].trim();
  const genericStopWords = new Set(["app", "bot", "tool", "system", "platform", "script", "website", "project", "program"]);

  if (firstSub.length >= 5 && !genericStopWords.has(firstSub.toLowerCase())) {
    clause = firstSub;
  } else if (splitSub.length > 1 && splitSub[1].trim().length >= 5) {
    clause = splitSub[1].trim();
    clause = clause.replace(/^(?:tells?|helps?|reminds?|allows?|enables?|guides?|teaches?|tracks?)\s+/i, "");
  }

  // If clause has " when to ", extract domain subject and action
  if (clause.toLowerCase().includes(" when to ")) {
    const parts = clause.split(/\s+when to\s+/i);
    const subject = parts[0].trim();
    let action = parts[1].split(/\s+based on\s+/i)[0].trim();
    if (action.toLowerCase() === "plant") action = "Planting";
    clause = `${subject} ${action} Adviser`;
  }

  // Fallback to category title if clause is too short or empty
  if (clause.length < 5) {
    return getFallbackTitle(category);
  }

  // Truncate to reasonable max length
  if (clause.length > 55) {
    clause = clause.slice(0, 52).trim() + "...";
  }

  // Format with title casing while preserving uppercase acronyms
  const titled = clause
    .split(/\s+/)
    .map((word) => {
      if (/^(CSV|API|CLI|AI|SMS|LGA|GPS|UI|UX|JSON|REST)$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  return titled;
}

function toSafeSlug(idOrName: string): string {
  return (
    idOrName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "module"
  );
}

function toSafeSnake(idOrName: string): string {
  return toSafeSlug(idOrName).replace(/-/g, "_");
}

function toPascalCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function deriveMilestoneFiles(
  p: ProjectPart,
  stepNum: number,
  fallbackArchitecture: ProjectArchitecture,
  category: ProjectCategory
): string[] {
  if (
    category === "agriculture" &&
    fallbackArchitecture.project_type === "web app" &&
    (!p.id || p.id.includes("rainfall") || p.id.includes("crop") || p.id.includes("zone") || p.id.includes("advisory"))
  ) {
    if (stepNum === 1) return ["components/RainfallInput.tsx", "data/riversZones.json"];
    if (stepNum === 2) return ["lib/cropCalendar.ts", "lib/rainfallRules.ts"];
    if (stepNum === 3) return ["components/AdvisoryDashboard.tsx", "components/StatusBadge.tsx"];
    return ["lib/farmStorage.ts", "data/sampleRainfall.json"];
  }

  const isExtension =
    category === "extension" ||
    (fallbackArchitecture.recommended_stack?.framework_or_tools || []).some((t) =>
      t.toLowerCase().includes("manifest v3")
    ) ||
    (fallbackArchitecture.recommended_stack?.language || "").toLowerCase().includes("extension");

  if (isExtension) {
    const partBase = p.id && !p.id.startsWith("part-") ? p.id : p.name;
    const safeSlug = toSafeSlug(partBase);
    const lowerName = (p.name || "").toLowerCase();
    const lowerId = (p.id || "").toLowerCase();

    if (lowerId.includes("manifest") || lowerName.includes("manifest") || stepNum === 1) {
      return ["manifest.json", "popup.html"];
    }
    if (lowerId.includes("content") || lowerName.includes("content script") || lowerName.includes("extractor")) {
      return ["scripts/content.js"];
    }
    if (lowerId.includes("popup") || lowerName.includes("popup")) {
      return ["popup/popup.html", "popup/popup.js", "popup/popup.css"];
    }
    if (
      lowerId.includes("storage") ||
      lowerId.includes("service-worker") ||
      lowerId.includes("background") ||
      lowerName.includes("storage") ||
      lowerName.includes("service worker")
    ) {
      return ["scripts/background.js", "lib/storage.js"];
    }

    if (stepNum === 2) return ["scripts/content.js"];
    if (stepNum === 3) return ["popup/popup.html", "popup/popup.js", "popup/popup.css"];
    if (stepNum === 4) return ["scripts/background.js", "lib/storage.js"];

    if (p.side.includes("back end")) {
      return [`scripts/${safeSlug}.js`];
    }
    return [`popup/${safeSlug}.js`];
  }

  const lang = (fallbackArchitecture.recommended_stack?.language || "").toLowerCase();
  const isPython = lang.includes("python");
  const projectType = fallbackArchitecture.project_type;
  const isBot = projectType === "bot" || category === "bot";
  const isCli = projectType === "CLI" || category === "cli";

  const partBase = p.id && !p.id.startsWith("part-") ? p.id : p.name;
  const safeSlug = toSafeSlug(partBase);
  const safeSnake = toSafeSnake(partBase);

  if (isPython) {
    if (isBot) {
      if (stepNum === 1) return ["bot.py", "requirements.txt", ".env.example"];
      if (p.side.includes("front end") || safeSnake.includes("command") || safeSnake.includes("handler")) {
        return [`commands/${safeSnake}.py`];
      }
      return [`${safeSnake}.py`];
    }
    if (isCli) {
      if (stepNum === 1) return ["cli.py", "requirements.txt"];
      return [`${safeSnake}.py`];
    }
    if (stepNum === 1) return ["main.py", "requirements.txt"];
    return [`${safeSnake}.py`];
  }

  if (isBot) {
    if (stepNum === 1) return ["src/bot.ts", "package.json", ".env.example"];
    if (p.side.includes("front end") || safeSlug.includes("command") || safeSlug.includes("handler")) {
      return [`src/commands/${safeSlug}.ts`];
    }
    return [`src/${safeSlug}.ts`];
  }

  if (isCli) {
    if (stepNum === 1) return ["src/cli.ts", "package.json"];
    return [`src/${safeSlug}.ts`];
  }

  const compName = toPascalCase(safeSlug);
  if (p.side === "front end (what the user sees)") {
    return [`components/${compName}.tsx`];
  }
  if (p.side === "back end (works behind the scenes)") {
    return [`lib/${safeSlug}.ts`];
  }
  return [`components/${compName}.tsx`, `lib/${safeSlug}.ts`];
}

/**
 * Generate a complete, tailor-made IdeaBlueprint from raw user input and user choices.
 */
export function generateBlueprint(
  ideaText: string,
  userChoices: Record<string, string> = {},
  retainedArchitecture?: ProjectArchitecture
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

  // Extract clean, authentic project title preserving domain context
  const projectTitle = extractProjectTitle(ideaText, category);

  // Architecture Decomposition: validate retained architecture before trusting it
  let fallbackArchitecture: ProjectArchitecture;
  let archSource: "model" | "fallback" = "fallback";

  if (retainedArchitecture && typeof retainedArchitecture === "object") {
    const archVal = validateAndRepairArchitecture(retainedArchitecture, ideaText);
    if (archVal.isModel && archVal.architecture.parts && archVal.architecture.parts.length >= 3) {
      fallbackArchitecture = archVal.architecture;
      archSource = "model";
    } else {
      console.warn(
        `[FallbackGenerator] Retained architecture failed validation (${archVal.warnings.join("; ")}). Safely reverting to domain heuristic.`
      );
      fallbackArchitecture = generateFallbackArchitecture(ideaText, activeChoices);
      archSource = "fallback";
    }
  } else {
    fallbackArchitecture = generateFallbackArchitecture(ideaText, activeChoices);
    archSource = "fallback";
  }

  // Construct Strategy Decision sentence
  const strategyDecision = buildStrategySummary(category, activeChoices);

  // Summary
  const summary = buildSummaryDetail(category, activeChoices, ideaText);

  // Pitfalls specific to this build
  const pitfalls = getPitfallsForCategory(category, activeChoices);

  // Calibrated Tech Stack
  const techStack =
    archSource === "model"
      ? buildTechStackFromArchitecture(fallbackArchitecture)
      : buildTechStack(category, activeChoices);

  // Phased Roadmap: derive directly from architecture parts when available
  const roadmap =
    archSource === "model" && fallbackArchitecture.parts.length >= 3
      ? fallbackArchitecture.parts.slice(0, 4).map((p, idx) => ({
          phase: `Phase ${idx + 1}`,
          title: p.name,
          description: p.one_line_purpose,
        }))
      : buildRoadmap(category, activeChoices, projectTitle);

  // Next Actions
  const nextActions = buildNextActions(category, activeChoices);

  // Targeted Resources
  const resources = buildResources(category, activeChoices);

  // AI Agent Pairing Guide & First Prompt
  const agentGuide = buildAgentGuide(category, activeChoices, projectTitle, summary, roadmap, nextActions);

  const matchedSkills = retrieveKnowledge(ideaText, activeChoices);

  // Derive build milestones directly from the domain-tailored architecture parts
  const isPython = (fallbackArchitecture.recommended_stack?.language || "").toLowerCase().includes("python");
  const isBot = fallbackArchitecture.project_type === "bot" || category === "bot";
  const isCli = fallbackArchitecture.project_type === "CLI" || category === "cli";

  const nodes: RoadmapNode[] = fallbackArchitecture.parts.slice(0, 4).map((p, idx) => {
    const stepNum = idx + 1;
    const files = deriveMilestoneFiles(p, stepNum, fallbackArchitecture, category);

    const isExtensionProject =
      category === "extension" ||
      (fallbackArchitecture.recommended_stack?.language || "").toLowerCase().includes("extension") ||
      (fallbackArchitecture.recommended_stack?.framework_or_tools || []).some((t) =>
        t.toLowerCase().includes("manifest v3")
      );

    const starterArtifacts =
      isExtensionProject && stepNum === 1
        ? createExtensionStarterArtifacts(projectTitle)
        : undefined;

    return {
      id: `node-${stepNum}`,
      step: stepNum,
      title: p.name,
      subtitle: `${p.side.split(" ")[0]} milestone`,
      badge: stepNum <= 2 ? "CORE MVP" : stepNum === 3 ? "RECOMMENDED" : "POLISH",
      goal: p.one_line_purpose,
      definitionOfDone: [
        `File(s) ${files.join(", ")} exist and compile without syntax errors.`,
        p.example_look_feel_function || `The core behavior in "${p.name}" functions as expected.`,
      ],
      conceptToLearn: p.name,
      estimatedMinutes: 45 + stepNum * 10,
      filesToCreate: files.slice(0, 3),
      keyPackages: fallbackArchitecture.recommended_stack.framework_or_tools.slice(0, 3),
      stepPrompt: `I am building ${projectTitle}.\nPROJECT GOAL: ${summary}\n\nWe are executing Step ${stepNum}: ${p.name}.\nPurpose: ${p.one_line_purpose}.\nFiles to create: ${files.join(", ")}.\n\nRULES: Explain your technical choices in plain language before writing code. Build ONLY this single milestone and STOP after this step so I can verify the changes.`,
      resources: p.resources?.map((r) => ({ title: r.title, url: r.url })) || [
        { title: "MDN Web Docs", url: "https://developer.mozilla.org" },
      ],
      starterArtifacts,
    };
  });

  const rawFallback = {
    projectTitle,
    summary,
    strategyDecision,
    architecture: fallbackArchitecture,
    pitfalls,
    roadmap,
    nextActions,
    techStack,
    resources,
    agentGuide,
    nodes,
  };

  const profile = {
    codingStyle: (activeChoices["coding_style"] === "myself" ? "myself" : activeChoices["coding_style"] === "mix" ? "mix" : "vibe") as "vibe" | "mix" | "myself",
    experienceLevel: (activeChoices["experience_level"] === "intermediate" ? "intermediate" : activeChoices["experience_level"] === "beginner" ? "beginner" : "none") as "none" | "beginner" | "intermediate",
    hoursPerDay: activeChoices["time_budget"] === "light" ? 1 : activeChoices["time_budget"] === "weekend" ? 8 : 2,
    daysAvailable: activeChoices["time_budget"] === "light" ? 5 : activeChoices["time_budget"] === "weekend" ? 2 : 7,
    customAnswers: activeChoices,
  };

  const validation = validateAndRepairBlueprint(rawFallback, matchedSkills[0], ideaText, profile);
  const result = validation.blueprint;
  result.isFallback = true;
  result.userChoices = activeChoices;
  result.learnerProfile = profile;
  result.sourceBadges = {
    architecture: archSource,
    startHere: "fallback",
    foundations: "curated",
    productMap: "fallback",
    milestones: "fallback",
    techStack: "fallback",
    levelUp: "fallback",
    agentGuide: "fallback",
  };

  return result;
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
    agriculture: "Local Rainfall & Crop Planting Advisory Guide",
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
    }, paired with zero-auth browser LocalStorage for instant, frictionless evaluation.`;
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
  if (category === "agriculture") {
    return `Strategy calibrated for local rainfall threshold monitoring, verified crop water demand rules, and 100% offline-first storage so farmers and field workers can access planting guidance without internet.`;
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
    agriculture: "An agricultural advisory guide that evaluates local rainfall patterns and crop water demands to recommend planting readiness with transparent agronomic assumptions.",
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
        name: "Next.js 15 App Router",
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

  if (category === "agriculture") {
    return [
      {
        category: "Frontend Framework",
        name: "Next.js 15 (App Router) + React",
        reason: "Fast responsive interface with clear weather cards and crop selection controls.",
      },
      {
        category: "Weather & Rainfall Data",
        name: "Open-Meteo API / Local Fixtures",
        reason: "Free open precipitation data without complex API keys, paired with offline sample data.",
      },
      {
        category: "Styling & Accessibility",
        name: "Tailwind CSS",
        reason: "High-contrast status indicators ('Optimal', 'Wait', 'Risk') easily readable outdoors.",
      },
      {
        category: "Offline Cache",
        name: "Browser LocalStorage",
        reason: "Preserves farm zone and recent rainfall observations for rural areas with spotty connectivity.",
      },
    ];
  }

  if (category === "bot") {
    return [
      {
        category: "Bot Framework",
        name: "discord.js (or python-telegram-bot)",
        reason: "Active beginner documentation, event-driven gateway support, and easy slash command setup.",
      },
      {
        category: "Runtime",
        name: "Node.js (or Python)",
        reason: "Asynchronous I/O handles incoming chat events without blocking user interactions.",
      },
      {
        category: "Scheduler",
        name: "node-cron (or APScheduler)",
        reason: "Lightweight background timer loop for sending scheduled deadline alerts.",
      },
      {
        category: "Persistence",
        name: "Local JSON File Storage",
        reason: "Saves bot state directly to disk without requiring external database hosting.",
      },
    ];
  }

  if (category === "cli") {
    return [
      {
        category: "CLI Engine",
        name: "Commander.js (or Python Typer)",
        reason: "Parses command-line arguments, options, and help text cleanly with zero boilerplate.",
      },
      {
        category: "Terminal Styling",
        name: "picocolors & cli-table3 (or Rich)",
        reason: "Adds colored output, progress indicators, and clean ASCII tables to terminal stdout.",
      },
      {
        category: "File Parser",
        name: "csv-parser / fast-csv",
        reason: "Streams and processes file data efficiently with low memory footprint.",
      },
      {
        category: "Data Storage",
        name: "Local File System",
        reason: "Reads directly from input files and saves processed exports locally.",
      },
    ];
  }

  // Default Web App / Habit / Flashcards
  return [
    {
      category: "Frontend Framework",
      name: "Next.js 15 (App Router)",
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

function buildTechStackFromArchitecture(arch: ProjectArchitecture): StackItem[] {
  const stack = arch.recommended_stack;
  const items: StackItem[] = [
    {
      category: "Language / Runtime",
      name: stack.language,
      reason: stack.why_in_plain_english || `Core programming environment for this ${arch.project_type}.`,
    },
  ];

  if (Array.isArray(stack.framework_or_tools) && stack.framework_or_tools.length > 0) {
    items.push({
      category: "Core Engine / Tool",
      name: stack.framework_or_tools[0],
      reason: `Primary library recommended for building this ${arch.project_type}.`,
    });

    for (let i = 1; i < Math.min(stack.framework_or_tools.length, 3); i++) {
      items.push({
        category: "Supporting Utility",
        name: stack.framework_or_tools[i],
        reason: `Utility package providing specialized functionality for ${arch.project_type}.`,
      });
    }
  }

  const isNonWeb =
    arch.project_type === "bot" ||
    arch.project_type === "CLI" ||
    arch.project_type === "data/script";

  items.push({
    category: "Persistence / Storage",
    name: isNonWeb ? "Local JSON / Text Files" : "Browser LocalStorage",
    reason: isNonWeb
      ? "Zero-server, local disk persistence preserving your state across executions."
      : "100% offline-first client storage for instant, frictionless evaluation without database setup.",
  });

  return items;
}

function buildRoadmap(category: ProjectCategory, choices: Record<string, string>, title: string): BlueprintPhase[] {
  if (category === "agriculture") {
    return [
      {
        phase: "Phase 1",
        title: "Rainfall Input & Local Zone Selection",
        description: "Build zone selector (Rivers State LGA) and rainfall measurement input with baseline preset data.",
      },
      {
        phase: "Phase 2",
        title: "Crop Water Rules & Advisory Engine",
        description: "Write rule evaluator comparing cumulative precipitation against crop moisture requirements with clear caveats.",
      },
      {
        phase: "Phase 3",
        title: "Planting Calendar & Visual Recommendation Cards",
        description: "Render high-contrast status cards with plain-language explanations of readiness and safety disclaimers.",
      },
      {
        phase: "Phase 4",
        title: "Offline Storage & Field Data Export",
        description: "Persist farm profile and rainfall log locally so guidance remains accessible without internet connection.",
      },
    ];
  }

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
  if (category === "agriculture") {
    return [
      {
        step: 1,
        action: "Define Rivers State agricultural zones and crop requirements in data/zones.ts",
        detail: "Create baseline rainfall thresholds for staple crops (cassava, maize, yam) across zones.",
      },
      {
        step: 2,
        action: "Build rainfall input component with millimeter sliders and historical presets",
        detail: "Allow farmers to enter rainfall observations manually or choose standard baseline seasons.",
      },
      {
        step: 3,
        action: "Implement evaluatePlantingWindow pure calculation function",
        detail: "Compare 14-day cumulative rainfall against crop moisture minimums and return clear status codes.",
      },
      {
        step: 4,
        action: "Render high-visibility advisory cards with agronomic safety disclaimer",
        detail: "Display color-coded guidance ('Optimal to Plant', 'Wait for Rain') with explicit rule explanations.",
      },
    ];
  }

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

  if (category === "agriculture") {
    return [
      {
        type: "Weather API",
        title: "Open-Meteo Weather & Rainfall Documentation",
        url: "https://open-meteo.com/en/docs",
      },
      {
        type: "Agronomic Guide",
        title: "FAO Crop Water Requirements & Irrigation Standards",
        url: "https://www.fao.org/land-water/databases-and-software/crop-information/en/",
      },
      {
        type: "Offline Storage",
        title: "MDN Web Storage API Documentation",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
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
      type: "Pair Programming Guide",
      title: "AI Coding Agents: Effective Pair Programming Guide",
      url: "https://docs.github.com/en/copilot",
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
