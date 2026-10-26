import {
  IdeaBlueprint,
  RoadmapNode,
  PitfallItem,
  BlueprintPhase,
  NextAction,
  StackItem,
  First20Minutes,
  ProductMap,
  FoundationModule,
  LearnerProfileAnswers,
  ProjectArchitecture,
  ProjectType,
  ProjectPart,
  ProjectSide,
  RecommendedStack,
  SectionSource,
  StarterArtifact,
} from "@/types/blueprint";
import { sanitizeResources, isValidUrl } from "@/lib/linkValidator";
import { SkillModule, buildRoadmapNodes } from "@/lib/knowledgeBank";
import { buildTailoredFoundations, FOUNDATIONS_BANK } from "@/lib/foundationsBank";
import { createExtensionStarterArtifacts } from "@/lib/artifactVerifier";

export interface ValidationResult {
  isValid: boolean;
  blueprint: IdeaBlueprint;
  warnings: string[];
}

/**
 * Validates and repairs the ProjectArchitecture object to guarantee 3-7 parts,
 * valid side strings, clean dependencies, and plain English stack rationale.
 */
export function validateAndRepairArchitecture(
  rawArch: any,
  rawIdea: string
): { architecture: ProjectArchitecture; warnings: string[]; isModel: boolean } {
  const warnings: string[] = [];
  let isModel = rawArch && typeof rawArch === "object";

  // 1. project_type
  const allowedTypes: ProjectType[] = [
    "web app",
    "mobile app",
    "bot",
    "CLI",
    "data/script",
    "game",
    "other",
  ];
  let project_type: ProjectType = "web app";
  if (
    typeof rawArch?.project_type === "string" &&
    allowedTypes.includes(rawArch.project_type as ProjectType)
  ) {
    project_type = rawArch.project_type as ProjectType;
  } else {
    isModel = false;
    const lower = rawIdea.toLowerCase();
    if (lower.includes("bot") || lower.includes("discord") || lower.includes("telegram")) {
      project_type = "bot";
    } else if (
      lower.includes("cli") ||
      lower.includes("command line") ||
      lower.includes("terminal")
    ) {
      project_type = "CLI";
    } else if (
      lower.includes("mobile") ||
      lower.includes("ios") ||
      lower.includes("android")
    ) {
      project_type = "mobile app";
    } else if (
      lower.includes("scraper") ||
      lower.includes("crawler") ||
      lower.includes("script")
    ) {
      project_type = "data/script";
    } else if (lower.includes("game")) {
      project_type = "game";
    } else {
      project_type = "web app";
    }
    warnings.push(`Inferred project_type as '${project_type}'.`);
  }

  // 2. front_back_explained_simply
  let front_back_explained_simply =
    typeof rawArch?.front_back_explained_simply === "string"
      ? rawArch.front_back_explained_simply.trim()
      : "";
  if (!front_back_explained_simply) {
    isModel = false;
    const isExtension =
      (typeof rawArch?.recommended_stack?.language === "string" &&
        rawArch.recommended_stack.language.toLowerCase().includes("extension")) ||
      (Array.isArray(rawArch?.recommended_stack?.framework_or_tools) &&
        rawArch.recommended_stack.framework_or_tools.some((t: any) =>
          String(t).toLowerCase().includes("manifest v3")
        )) ||
      rawIdea.toLowerCase().includes("extension") ||
      rawIdea.toLowerCase().includes("chrome") ||
      rawIdea.toLowerCase().includes("browser add-on") ||
      rawIdea.toLowerCase().includes("browser plugin");

    if (isExtension) {
      front_back_explained_simply =
        "For a Chrome extension, the FRONT END is what you see and interact with—the extension popup window (popup.html) when clicking the toolbar icon, plus content scripts injected into the webpage to read article text. The BACK END is the background service worker running behind the scenes to handle browser events and chrome.storage.local which saves your summaries offline.";
    } else if (project_type === "bot") {
      front_back_explained_simply =
        "For a bot, the FRONT END is what users see and interact with in the chat app (Discord, Slack, or Telegram)—slash commands, autocomplete options, and rich card embeds. The BACK END is the bot script running behind the scenes on your computer or cloud server that connects to the Discord gateway API, calculates dates/reminders, and saves data to disk.";
    } else if (project_type === "CLI") {
      front_back_explained_simply =
        "For a command-line tool, the FRONT END is what you see in the terminal: colored status text, interactive arrow-key selection menus, and formatted ASCII tables. The BACK END is the script logic running behind the scenes: reading raw files from your disk, validating data, performing math calculations, and writing outputs.";
    } else if (project_type === "mobile app") {
      front_back_explained_simply =
        "For a mobile app, the FRONT END is the touch interface on your phone (buttons, lists, modals, and gestures) built with React Native. The BACK END is the local offline storage (AsyncStorage) that saves your data securely on the device without requiring cloud databases.";
    } else if (project_type === "data/script") {
      front_back_explained_simply =
        "For a data script or scraper, the FRONT END is the user output—either a clean terminal status feed, an exported CSV/JSON spreadsheet, or a minimal digest table. The BACK END is the extraction engine that fetches pages, parses HTML tags, cleans text, and removes duplicate records.";
    } else {
      front_back_explained_simply =
        "For a web app, the FRONT END is the visual user interface in your browser—interactive buttons, cards, and forms built with HTML, CSS, and React. The BACK END is where your data is stored and calculated. For this MVP, browser LocalStorage acts as your offline back end so your data stays saved without having to build a database server.";
    }
    warnings.push("Missing front_back_explained_simply; generated from project type.");
  }

  // 3. recommended_stack
  const rawStack = rawArch?.recommended_stack;
  let recommended_stack: RecommendedStack;
  if (
    rawStack &&
    typeof rawStack.language === "string" &&
    Array.isArray(rawStack.framework_or_tools) &&
    typeof rawStack.why_in_plain_english === "string"
  ) {
    recommended_stack = {
      language: rawStack.language,
      framework_or_tools: rawStack.framework_or_tools.map(String).slice(0, 5),
      why_in_plain_english: rawStack.why_in_plain_english,
      alternatives: Array.isArray(rawStack.alternatives)
        ? rawStack.alternatives.map((a: any) => ({
            name: String(a?.name || "Alternative"),
            pick_this_if: String(a?.pick_this_if || "You need custom capabilities"),
          }))
        : [],
    };
  } else {
    isModel = false;
    if (project_type === "bot") {
      recommended_stack = {
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
      };
    } else if (project_type === "CLI") {
      recommended_stack = {
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
      };
    } else if (
      rawIdea.toLowerCase().includes("extension") ||
      rawIdea.toLowerCase().includes("chrome") ||
      rawIdea.toLowerCase().includes("browser add-on") ||
      rawIdea.toLowerCase().includes("browser plugin")
    ) {
      recommended_stack = {
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
      };
    } else {
      recommended_stack = {
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
      };
    }
    warnings.push("Missing or invalid recommended_stack; repaired.");
  }

  // 4. parts (Must be 3-7 parts derived from this idea)
  const allowedSides: ProjectSide[] = [
    "front end (what the user sees)",
    "back end (works behind the scenes)",
    "both",
  ];
  let parts: ProjectPart[] = [];
  if (Array.isArray(rawArch?.parts) && rawArch.parts.length >= 2) {
    parts = rawArch.parts.map((p: any, idx: number) => {
      const hasValidName = typeof p?.name === "string" && p.name.trim().length > 0;
      const hasValidPurpose = typeof p?.one_line_purpose === "string" && p.one_line_purpose.trim().length > 0;

      if (!hasValidName || !hasValidPurpose) {
        isModel = false;
        warnings.push(`Part ${idx + 1} missing required name or purpose; synthesized defaults.`);
      }

      const id = typeof p?.id === "string" && p.id.trim() ? p.id.trim() : `part-${idx + 1}`;
      const name = hasValidName ? p.name.trim() : `Component Part ${idx + 1}`;
      const one_line_purpose = hasValidPurpose
        ? p.one_line_purpose.trim()
        : "Implements core functional requirement.";
      const side: ProjectSide = allowedSides.includes(p?.side) ? p.side : "both";
      const depends_on = Array.isArray(p?.depends_on) ? p.depends_on.map(String) : [];
      return {
        id,
        name,
        one_line_purpose,
        side,
        depends_on,
        example_look_feel_function:
          typeof p?.example_look_feel_function === "string" && p.example_look_feel_function.trim()
            ? p.example_look_feel_function.trim()
            : `Concrete operation of ${name} during regular usage.`,
        steps: Array.isArray(p?.steps) && p.steps.length > 0 ? p.steps.map(String).slice(0, 3) : undefined,
        resources: Array.isArray(p?.resources)
          ? p.resources.map((r: any) => ({
              title: String(r?.title || "Guide"),
              url: isValidUrl(r?.url) ? r.url : "https://developer.mozilla.org",
              why: String(r?.why || "Relevant reference for beginners"),
            }))
          : undefined,
      };
    });
  }

  if (parts.length < 3) {
    isModel = false;
    warnings.push(`Parts count (${parts.length}) < 3; synthesized domain parts.`);
    if (project_type === "bot") {
      parts = [
        {
          id: "bot-gateway-client",
          name: "Bot Connection & Credentials Config",
          one_line_purpose: "Authenticates with Discord's API gateway using a bot token and stays online.",
          side: "back end (works behind the scenes)",
          depends_on: [],
          example_look_feel_function: "Terminal logs 'Logged in as DeadlineBot#1001' and bot appears online in Discord.",
          steps: ["Create Discord application & copy token", "Create .env with DISCORD_TOKEN", "Run client.login()"],
        },
        {
          id: "slash-commands",
          name: "Interactive Slash Commands & Embeds",
          one_line_purpose: "Registers chat commands like /deadline that show autocomplete and rich embeds.",
          side: "front end (what the user sees)",
          depends_on: ["bot-gateway-client"],
          example_look_feel_function: "A student types '/deadline add subject:Physics' and the bot replies with an embed card.",
          steps: ["Define SlashCommandBuilder schema", "Register slash commands with REST API", "Handle interaction event"],
        },
        {
          id: "reminder-scheduler",
          name: "Cron Scheduler & Notification Dispatcher",
          one_line_purpose: "Monitors upcoming deadlines every minute and posts automated alert pings.",
          side: "back end (works behind the scenes)",
          depends_on: ["slash-commands"],
          example_look_feel_function: "At 9:00 AM, the bot pings @student with a countdown reminder.",
          steps: ["Install node-cron", "Create 1-minute checker loop", "Send alert message to channel"],
        },
        {
          id: "local-storage-json",
          name: "Local JSON File Persistence",
          one_line_purpose: "Saves deadlines to a local deadlines.json file so alerts survive bot restarts.",
          side: "back end (works behind the scenes)",
          depends_on: ["bot-gateway-client"],
          example_look_feel_function: "A clean deadlines.json file on your disk holding arrays of deadline items.",
          steps: ["Write saveDeadlines(items) helper", "Write loadDeadlines() with try/catch", "Verify persistence"],
        },
      ];
    } else if (project_type === "CLI") {
      parts = [
        {
          id: "csv-stream-reader",
          name: "Bank CSV Ingestion & Header Normalizer",
          one_line_purpose: "Reads raw bank export files from your computer and standardizes dates and amounts.",
          side: "back end (works behind the scenes)",
          depends_on: [],
          example_look_feel_function: "Reads 'statement.csv' and extracts clean rows with amountInCents, date, and description.",
          steps: ["Install csv-parser", "Create readable stream with fs.createReadStream", "Normalize dates and currency"],
        },
        {
          id: "budget-aggregator",
          name: "Category Aggregator & Budget Calculator",
          one_line_purpose: "Categorizes transactions (Groceries, Utilities) and calculates spending vs budget.",
          side: "back end (works behind the scenes)",
          depends_on: ["csv-stream-reader"],
          example_look_feel_function: "Calculates total spending ($1,240.50) and categorizes largest expenses.",
          steps: ["Create category keyword dictionary", "Aggregate total spend per category", "Compare totals to limits"],
        },
        {
          id: "terminal-cli-interface",
          name: "Command Flags & Interactive Prompts",
          one_line_purpose: "Provides friendly commands like 'finance import <file>' and interactive arrow-key selection menus.",
          side: "front end (what the user sees)",
          depends_on: [],
          example_look_feel_function: "Running `finance` displays: '? Select report: › Monthly Spending / Category Breakdown'",
          steps: ["Configure Commander CLI options", "Add interactive prompt using Inquirer", "Add helpful --help manual page"],
        },
        {
          id: "ascii-report-table",
          name: "Colorized ASCII Summary Table & Charts",
          one_line_purpose: "Prints clear, beautifully formatted tables and text-based progress bars directly in the terminal.",
          side: "front end (what the user sees)",
          depends_on: ["budget-aggregator", "terminal-cli-interface"],
          example_look_feel_function: "Prints a box-drawn border table: '┌ Groceries │ $340 / $400 │ [████████░░] 85% ┐'",
          steps: ["Install cli-table3 and picocolors", "Format rows with colored currency strings", "Render progress bar string"],
        },
      ];
    } else if (
      rawIdea.toLowerCase().includes("extension") ||
      rawIdea.toLowerCase().includes("chrome") ||
      rawIdea.toLowerCase().includes("browser add-on") ||
      rawIdea.toLowerCase().includes("browser plugin")
    ) {
      const isSummarizer =
        rawIdea.toLowerCase().includes("summariz") || rawIdea.toLowerCase().includes("article");
      parts = [
        {
          id: "manifest-config",
          name: "Manifest V3 Configuration & Permissions",
          one_line_purpose:
            "Declares permissions, toolbar action popup entrypoint, and background service worker.",
          side: "both",
          depends_on: [],
          example_look_feel_function:
            "A valid manifest.json file loaded into chrome://extensions with zero configuration errors.",
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
          name: isSummarizer
            ? "Webpage Article Text Extractor (Content Script)"
            : "Webpage DOM Content Script",
          one_line_purpose: isSummarizer
            ? "Injects into the active webpage tab to extract readable article headline and body text."
            : "Interacts directly with the webpage DOM on the active browser tab.",
          side: "front end (what the user sees)",
          depends_on: ["manifest-config"],
          example_look_feel_function:
            "Extracts readable text from the active webpage and passes it to the extension.",
          steps: [
            "Query target DOM elements on the active page",
            "Extract and sanitize target content",
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
          name: isSummarizer
            ? "Popup Summary Viewer & Action Trigger"
            : "Toolbar Action & Popup Controls",
          one_line_purpose: isSummarizer
            ? "Provides a clean popup interface to trigger summarization and view highlights."
            : "Renders a compact toolbar popup window for toggles, settings, and status triggers.",
          side: "front end (what the user sees)",
          depends_on: ["manifest-config"],
          example_look_feel_function:
            "Clicking the toolbar icon opens a clean 360x480px popup with interactive controls.",
          steps: [
            "Build popup.html structure with controls and status indicator",
            "Style with clean typography and high-contrast buttons",
            "Integrate summarization service helper with extractive bullet points",
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
          name: isSummarizer
            ? "Service Worker & Saved Summaries Storage"
            : "Background Service Worker & Local Storage",
          one_line_purpose: isSummarizer
            ? "Coordinates extension lifecycle events and persists saved summaries to chrome.storage.local."
            : "Coordinates browser events and persists user preferences offline via chrome.storage.local.",
          side: "back end (works behind the scenes)",
          depends_on: ["popup-ui"],
          example_look_feel_function:
            "Extension settings and saved records persist across browser restarts in chrome.storage.local.",
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
      ];
    } else {
      parts = [
        {
          id: "primary-interactive-view",
          name: "Interactive View & Action Controls",
          one_line_purpose: "Renders the main list of items with tactile toggle buttons and immediate visual feedback.",
          side: "front end (what the user sees)",
          depends_on: [],
          example_look_feel_function: "A clean card showing an item with a satisfying toggle circle that bounces when clicked.",
          steps: ["Scaffold ItemCard component", "Add onClick toggle handler", "Render list using array.map"],
        },
        {
          id: "state-calculation-engine",
          name: "Core Calculation & Progress Math Engine",
          one_line_purpose: "Performs the core domain calculations, progress percentages, and metrics.",
          side: "back end (works behind the scenes)",
          depends_on: ["primary-interactive-view"],
          example_look_feel_function: "Calculates that checking 4 out of 5 daily items equals 80% completion.",
          steps: ["Write pure calculation helper function", "Add unit validation test", "Hook calculation into component state"],
        },
        {
          id: "local-storage-sync",
          name: "Browser LocalStorage Persistence Layer",
          one_line_purpose: "Saves state to browser memory so data survives page refreshes without needing a server.",
          side: "back end (works behind the scenes)",
          depends_on: ["primary-interactive-view"],
          example_look_feel_function: "When you reload or close the tab, all of your entries stay exactly where you left them.",
          steps: ["Write custom useLocalStorage hook", "Load initial items on component mount", "Save serialized JSON when state updates"],
        },
      ];
    }
  } else if (parts.length > 7) {
    warnings.push(`Parts count capped from ${parts.length} to 7.`);
    parts = parts.slice(0, 7);
  }

  const finished_product_preview =
    typeof rawArch?.finished_product_preview === "string" && rawArch.finished_product_preview.trim()
      ? rawArch.finished_product_preview.trim()
      : `A working, beginner-friendly ${project_type} executing cleanly with offline persistence and immediate feedback.`;

  return {
    architecture: {
      project_type,
      front_back_explained_simply,
      recommended_stack,
      parts,
      finished_product_preview,
    },
    warnings,
    isModel,
  };
}

/**
 * Validates raw JSON object from Gemini and safely repairs any missing
 * or malformed fields using matched knowledge bank and foundations ground truth.
 */
export function validateAndRepairBlueprint(
  raw: any,
  defaultSkill: SkillModule,
  rawIdea: string,
  learnerProfile?: LearnerProfileAnswers
): ValidationResult {
  const warnings: string[] = [];

  const profile: LearnerProfileAnswers = learnerProfile || {
    codingStyle: "vibe",
    experienceLevel: "none",
    hoursPerDay: 2,
    daysAvailable: 7,
  };

  // 0. Project Architecture (THE foundational classified object)
  const archResult = validateAndRepairArchitecture(raw?.architecture, rawIdea);
  const architecture = archResult.architecture;
  warnings.push(...archResult.warnings);

  // 1. Project Title
  let projectTitle = typeof raw?.projectTitle === "string" ? raw.projectTitle.trim() : "";
  if (!projectTitle || projectTitle.length < 3) {
    projectTitle = "Tailored Software Architecture";
    warnings.push("Missing or invalid projectTitle; repaired.");
  }

  // 2. Summary
  let summary = typeof raw?.summary === "string" ? raw.summary.trim() : "";
  if (!summary || summary.length < 8) {
    summary = rawIdea.slice(0, 180);
    warnings.push("Missing or invalid summary; repaired from raw idea.");
  }

  // 3. Strategy Decision
  let strategyDecision = typeof raw?.strategyDecision === "string" ? raw.strategyDecision.trim() : "";
  if (!strategyDecision) {
    strategyDecision = defaultSkill.summary;
    warnings.push("Missing strategyDecision; populated from domain knowledge.");
  }


  // 4. Foundations Selection (From Ground Truth Bank)
  let foundationsData = raw?.foundations;
  let tailoredFoundations = buildTailoredFoundations(rawIdea, profile);

  if (foundationsData && Array.isArray(foundationsData.selectedModules) && foundationsData.selectedModules.length > 0) {
    // Validate each module against ground truth bank
    const verifiedModules: FoundationModule[] = [];
    for (const m of foundationsData.selectedModules) {
      const bankModule = FOUNDATIONS_BANK[m?.id];
      if (bankModule) {
        verifiedModules.push({
          ...bankModule,
          tier: m?.tier === "core" || m?.tier === "deeper" || m?.tier === "later" ? m.tier : bankModule.tier,
          whyNeededForProject: typeof m?.whyNeededForProject === "string" ? m.whyNeededForProject : `Essential foundation for this build.`,
        });
      }
    }

    if (verifiedModules.length >= 3) {
      tailoredFoundations.selectedModules = verifiedModules;
    }
  }

  // 5. First 20 Minutes ("Your first 20 minutes")
  let first20Minutes: First20Minutes;
  const rawFirst20 = raw?.first20Minutes;
  const slug = projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-project";

  if (
    rawFirst20 &&
    typeof rawFirst20.action === "string" &&
    Array.isArray(rawFirst20.whatToDo) &&
    typeof rawFirst20.whatDoneLooksLike === "string"
  ) {
    first20Minutes = {
      action: rawFirst20.action,
      why: rawFirst20.why || "Sets up your safe sandbox before writing any feature code.",
      whatToDo: rawFirst20.whatToDo.slice(0, 4),
      whatDoneLooksLike: rawFirst20.whatDoneLooksLike,
      starterTerminalCommand: rawFirst20.starterTerminalCommand || "git status",
    };
  } else {
    const stackTools = (architecture.recommended_stack?.framework_or_tools || []).map((t) => t.toLowerCase()).join(" ");
    const stackLang = (architecture.recommended_stack?.language || "").toLowerCase();
    const ideaLower = rawIdea.toLowerCase();
    const frontBackLower = (architecture.front_back_explained_simply || "").toLowerCase();
    const combinedContext = `${stackTools} ${stackLang} ${ideaLower} ${frontBackLower}`;

    let platformName = "its messaging platform";
    let defaultBotPackages = "discord.js dotenv";
    let defaultPyBotPackages = "python-telegram-bot python-dotenv";

    if (combinedContext.includes("telegram") || combinedContext.includes("telegraf") || combinedContext.includes("grammy")) {
      platformName = "Telegram";
      defaultBotPackages = "telegraf dotenv";
      defaultPyBotPackages = "python-telegram-bot python-dotenv";
    } else if (combinedContext.includes("discord")) {
      platformName = "Discord";
      defaultBotPackages = "discord.js dotenv";
      defaultPyBotPackages = "discord.py python-dotenv";
    } else if (combinedContext.includes("slack") || combinedContext.includes("bolt")) {
      platformName = "Slack";
      defaultBotPackages = "@slack/bolt dotenv";
      defaultPyBotPackages = "slack-bolt python-dotenv";
    }

    const platformPhrase = platformName === "its messaging platform"
      ? "before connecting your bot to its messaging platform."
      : `before connecting your bot to ${platformName}.`;

    const isPython = stackLang.includes("python");
    const isNodeOrJs =
      stackLang.includes("node") ||
      stackLang.includes("javascript") ||
      stackLang.includes("typescript") ||
      !stackLang ||
      (!isPython && !stackLang.includes("go") && !stackLang.includes("rust"));
    const installPackages = architecture.recommended_stack?.framework_or_tools?.slice(0, 3).join(" ") || "";

    if (architecture.project_type === "bot") {
      if (isPython) {
        first20Minutes = {
          action: `Initialize a fresh Python bot environment in "${slug}"`,
          why: `Setting up a clean Python virtual environment with your bot library gives you a safe sandbox ${platformPhrase}`,
          whatToDo: [
            `Create a clean folder named "${slug}".`,
            "Open the folder inside VS Code or your terminal.",
            "Run `python -m venv venv` to create an isolated environment.",
            `Run pip install ${installPackages || defaultPyBotPackages} to install your bot engine.`,
          ],
          whatDoneLooksLike: `You see a venv directory and pip list displays your installed bot dependencies with zero errors.`,
          starterTerminalCommand: `mkdir ${slug} && cd ${slug} && python -m venv venv && pip install ${installPackages || defaultPyBotPackages}`,
        };
      } else if (isNodeOrJs) {
        first20Minutes = {
          action: `Initialize a fresh Node.js bot folder named "${slug}"`,
          why: `Setting up a clean directory with package.json and your bot libraries gives you a safe sandbox ${platformPhrase}`,
          whatToDo: [
            `Create a clean folder named "${slug}".`,
            "Open the folder inside VS Code or your terminal.",
            `Run npm init -y to create your package.json.`,
            `Run npm install ${installPackages || defaultBotPackages} to install your bot engine.`,
          ],
          whatDoneLooksLike: `You see a package.json and node_modules directory, with zero installation errors in your terminal.`,
          starterTerminalCommand: `mkdir ${slug} && cd ${slug} && npm init -y && npm install ${installPackages || defaultBotPackages}`,
        };
      } else {
        first20Minutes = {
          action: `Initialize a fresh bot project folder named "${slug}"`,
          why: `Setting up a clean directory gives you a safe sandbox ${platformPhrase}`,
          whatToDo: [
            `Create a clean folder named "${slug}".`,
            "Open the folder in your code editor or terminal.",
            "Initialize your project configuration and install dependencies.",
            "Verify your local setup runs with zero syntax errors.",
          ],
          whatDoneLooksLike: `Your workspace folder is initialized with configuration files and ready for your first feature milestone.`,
          starterTerminalCommand: `mkdir ${slug} && cd ${slug} && git init`,
        };
      }
    } else if (architecture.project_type === "CLI") {
      if (isPython) {
        first20Minutes = {
          action: `Initialize a fresh Python CLI tool folder named "${slug}"`,
          why: "Getting an empty directory with an isolated Python environment and CLI libraries lets you test terminal commands immediately.",
          whatToDo: [
            `Create a clean folder named "${slug}".`,
            "Open the folder in your code editor.",
            "Run `python -m venv venv` to create a virtual environment.",
            `Run pip install ${installPackages || "typer rich"} to install terminal parsing tools.`,
          ],
          whatDoneLooksLike: `A virtual environment exists and running 'python --version' outputs your current runtime version without errors.`,
          starterTerminalCommand: `mkdir ${slug} && cd ${slug} && python -m venv venv && pip install ${installPackages || "typer rich"}`,
        };
      } else {
        first20Minutes = {
          action: `Initialize a fresh CLI tool folder named "${slug}"`,
          why: "Getting an empty directory with your CLI dependencies configured lets you test terminal commands immediately.",
          whatToDo: [
            `Create a clean folder named "${slug}".`,
            "Open the folder in your code editor.",
            `Run npm init -y to configure the project.`,
            `Run npm install ${installPackages || "commander"} to install terminal parsing tools.`,
          ],
          whatDoneLooksLike: `A package.json file exists and running 'node -v' outputs your current runtime version without errors.`,
          starterTerminalCommand: `mkdir ${slug} && cd ${slug} && npm init -y && npm install ${installPackages || "commander"}`,
        };
      }
    } else if (
      (architecture.recommended_stack?.framework_or_tools || []).some((t) =>
        t.toLowerCase().includes("manifest v3")
      ) ||
      (architecture.recommended_stack?.language || "").toLowerCase().includes("extension") ||
      rawIdea.toLowerCase().includes("extension") ||
      rawIdea.toLowerCase().includes("chrome") ||
      rawIdea.toLowerCase().includes("browser add-on") ||
      rawIdea.toLowerCase().includes("browser plugin")
    ) {
      first20Minutes = {
        action: `Initialize a fresh Chrome Extension (Manifest V3) folder named "${slug}"`,
        why: "Setting up a clean directory with manifest.json and loading it unpacked into chrome://extensions lets you test browser integrations immediately.",
        whatToDo: [
          `Create a clean folder named "${slug}".`,
          "Open the folder inside VS Code or your terminal.",
          `Create a minimal manifest.json declaring "manifest_version": 3, "name": "${projectTitle}", and "version": "1.0.0".`,
          `Open chrome://extensions, toggle on "Developer mode", and click "Load unpacked" targeting your "${slug}" folder.`,
        ],
        whatDoneLooksLike:
          "Your extension appears in chrome://extensions with zero manifest errors, and its icon or action is visible in the browser toolbar.",
        starterTerminalCommand: `mkdir ${slug} && cd ${slug} && git init`,
      };
    } else {
      first20Minutes = {
        action: `Open your code editor and initialize a fresh project folder named "${slug}"`,
        why: "Getting an empty working folder under Git version control gives you an indestructible save point before you prompt an AI agent.",
        whatToDo: [
          `Create a clean folder on your computer named "${slug}".`,
          "Open the folder inside VS Code or Cursor.",
          "Open the built-in terminal (shortcut: `Ctrl+~` or `Cmd+~`).",
          "Run `git init` to turn on save checkpoints.",
        ],
        whatDoneLooksLike: `You see a hidden .git folder and running 'git status' outputs 'On branch master (or main)' with zero errors.`,
        starterTerminalCommand: `mkdir ${slug} && cd ${slug} && git init`,
      };
    }
    warnings.push("Missing first20Minutes; populated from architecture parameters.");
  }

  // 6. Product Map ("Your Project, Mapped" in Plain English)
  let productMap: ProductMap;
  const rawMap = raw?.productMap;
  if (
    rawMap &&
    typeof rawMap.whatItDoes === "string" &&
    Array.isArray(rawMap.userJourney) &&
    rawMap.dataItNeeds
  ) {
    productMap = {
      whatItDoes: rawMap.whatItDoes,
      userJourney: rawMap.userJourney.slice(0, 6),
      screens: Array.isArray(rawMap.screens)
        ? rawMap.screens.map((s: any) => ({
            name: typeof s?.name === "string" ? s.name : "Main Screen",
            userAction: typeof s?.userAction === "string" ? s.userAction : "Interacts with core feature.",
          }))
        : (architecture.recommended_stack?.framework_or_tools || []).some((t) =>
            t.toLowerCase().includes("manifest v3")
          ) ||
          (architecture.recommended_stack?.language || "").toLowerCase().includes("extension") ||
          rawIdea.toLowerCase().includes("extension") ||
          rawIdea.toLowerCase().includes("chrome")
        ? [
            {
              name: "Extension Toolbar Action & Popup Window (popup.html)",
              userAction: "Clicks toolbar icon to open popup, view summaries, or adjust settings.",
            },
            {
              name: "Webpage Injected Content Script",
              userAction: "Extracts readable article content and communicates with extension components.",
            },
          ]
        : architecture.project_type === "bot"
        ? [
            { name: "Discord Chat & Slash Command Interface", userAction: "Types slash commands to enter deadlines and views embed replies." },
            { name: "Direct Message Alert Channel", userAction: "Receives automated ping notifications before due dates." },
          ]
        : architecture.project_type === "CLI"
        ? [
            { name: "Terminal CLI Command & Menu", userAction: "Runs CLI command with flags and selects options with arrow keys." },
            { name: "Colorized ASCII Report Table", userAction: "Views formatted terminal output with expense totals and budget progress." },
          ]
        : [{ name: "Main Feature Screen", userAction: "Enters data and sees immediate feedback." }],
      dataItNeeds: {
        description: typeof rawMap.dataItNeeds?.description === "string"
          ? rawMap.dataItNeeds.description
          : "User entries stored locally.",
        storageForMvp: typeof rawMap.dataItNeeds?.storageForMvp === "string"
          ? rawMap.dataItNeeds.storageForMvp
          : (architecture.recommended_stack?.framework_or_tools || []).some((t) =>
              t.toLowerCase().includes("manifest v3")
            ) ||
            (architecture.recommended_stack?.language || "").toLowerCase().includes("extension") ||
            rawIdea.toLowerCase().includes("extension") ||
            rawIdea.toLowerCase().includes("chrome")
          ? "chrome.storage.local (sandboxed extension storage, zero server setup)"
          : architecture.project_type === "bot" || architecture.project_type === "CLI"
          ? "Local JSON/CSV file on disk (zero server setup required)"
          : "Browser localStorage (zero server required)",
        laterOptions: typeof rawMap.dataItNeeds?.laterOptions === "string"
          ? rawMap.dataItNeeds.laterOptions
          : "Cloud database with user authentication (Level Up Later)",
      },
      partsYouNeedNow: Array.isArray(rawMap.partsYouNeedNow) && rawMap.partsYouNeedNow.length > 0
        ? rawMap.partsYouNeedNow.map((p: any) => ({
            part: String(p?.part || "Core Interface"),
            reason: String(p?.reason || "Required to test the primary loop."),
          }))
        : architecture.parts.map((p) => ({ part: p.name, reason: p.one_line_purpose })),
      partsYouCanIgnoreForNow: Array.isArray(rawMap.partsYouCanIgnoreForNow)
        ? rawMap.partsYouCanIgnoreForNow.map((p: any) => ({
            part: String(p?.part || "Cloud Database & Auth"),
            reason: String(p?.reason || "Adds unnecessary setup complexity to Day 1."),
          }))
        : [
            { part: "User login & passwords", reason: "First-time users need instant access to test your app without making an account." },
            { part: "Cloud SQL database", reason: "Adds migration headaches; local storage solves 100% of Phase 1." },
            { part: "Payment gateways & subscriptions", reason: "Validate that users actually want the product before building checkout." },
          ],
      mvpVsLater: {
        v1DemoReady: Array.isArray(rawMap.mvpVsLater?.v1DemoReady)
          ? rawMap.mvpVsLater.v1DemoReady
          : architecture.parts.map((p) => p.name),
        v2Next: Array.isArray(rawMap.mvpVsLater?.v2Next)
          ? rawMap.mvpVsLater.v2Next
          : ["Export data to CSV/JSON", "Advanced formatting & sound alerts"],
        v3Future: Array.isArray(rawMap.mvpVsLater?.v3Future)
          ? rawMap.mvpVsLater.v3Future
          : ["Cloud sync across multiple devices", "User accounts & multi-tenant permissions"],
        outOfScopeWithReasons: Array.isArray(rawMap.mvpVsLater?.outOfScopeWithReasons)
          ? rawMap.mvpVsLater.outOfScopeWithReasons
          : [
              { feature: "Multi-user team collaboration", reason: "Requires WebSocket servers and complex permissions; out of scope for Phase 1 prototype." },
              { feature: "Native iOS / Android app store build", reason: "Desktop / web execution works immediately with zero compile friction." },
            ],
      },
      nextImplementationSteps: Array.isArray(rawMap.nextImplementationSteps)
        ? rawMap.nextImplementationSteps.map((s: any) => ({
            step: String(s?.step || "Next Action"),
            reason: String(s?.reason || "Refines user experience."),
          }))
        : [
            { step: "Add sample fixture items", reason: "Allows someone to test without typing from scratch." },
            { step: "Wrap storage read/write in try/catch", reason: "Prevents crashes if corrupted data exists." },
          ],
    };
  } else {
    // Generate clean fallback product map derived from architecture
    productMap = {
      whatItDoes: `A focused, beginner-friendly prototype of ${projectTitle}.`,
      userJourney:
        (architecture.recommended_stack?.framework_or_tools || []).some((t) =>
          t.toLowerCase().includes("manifest v3")
        ) ||
        (architecture.recommended_stack?.language || "").toLowerCase().includes("extension") ||
        rawIdea.toLowerCase().includes("extension") ||
        rawIdea.toLowerCase().includes("chrome")
          ? [
              "User navigates to any online article or webpage in Google Chrome.",
              "User clicks the extension icon in the browser toolbar to open the popup window.",
              "Content script extracts the article text from the active webpage tab.",
              "Extension generates or displays the concise summary in the popup interface.",
              "User clicks 'Save' to persist the summary to chrome.storage.local for offline reading.",
            ]
          : architecture.project_type === "bot"
          ? [
              "Student invites the bot to their Discord server.",
              "Student types a slash command (e.g. /deadline add) in chat.",
              "Bot validates inputs and stores the deadline in local storage.",
              "Bot displays a styled confirmation embed card.",
              "Bot scheduler alerts the student before due dates.",
            ]
          : architecture.project_type === "CLI"
          ? [
              "User opens the terminal in their project folder.",
              "User runs the command with target arguments or interactive flags.",
              "CLI reads the local files and performs calculations in memory.",
              "CLI prints formatted colorized ASCII tables to stdout.",
            ]
          : [
              "User opens the application in their browser.",
              "User enters initial data or clicks a starter preset.",
              "User triggers the primary action button.",
              "User views immediate visual feedback.",
              "Data remains preserved across page refreshes.",
            ],
      screens:
        (architecture.recommended_stack?.framework_or_tools || []).some((t) =>
          t.toLowerCase().includes("manifest v3")
        ) ||
        (architecture.recommended_stack?.language || "").toLowerCase().includes("extension") ||
        rawIdea.toLowerCase().includes("extension") ||
        rawIdea.toLowerCase().includes("chrome")
          ? [
              {
                name: "Extension Toolbar Action & Popup Window (popup.html)",
                userAction: "Clicks toolbar icon to open popup, view summaries, or adjust settings.",
              },
              {
                name: "Webpage Injected Content Script",
                userAction: "Extracts readable article content and communicates with extension components.",
              },
            ]
          : architecture.project_type === "bot"
          ? [
              { name: "Discord Chat & Slash Command Interface", userAction: "Types slash commands to enter deadlines and views embed replies." },
              { name: "Direct Message Alert Channel", userAction: "Receives automated ping notifications before due dates." },
            ]
          : architecture.project_type === "CLI"
          ? [
              { name: "Terminal CLI Command & Menu", userAction: "Runs CLI command with flags and selects options with arrow keys." },
              { name: "Colorized ASCII Report Table", userAction: "Views formatted terminal output with expense totals and budget progress." },
            ]
          : [
              { name: "Main Feature View", userAction: "Enter data, trigger action, and see live results." },
            ],
      dataItNeeds: {
        description: "Primary user items and current progress counters.",
        storageForMvp:
          (architecture.recommended_stack?.framework_or_tools || []).some((t) =>
            t.toLowerCase().includes("manifest v3")
          ) ||
          (architecture.recommended_stack?.language || "").toLowerCase().includes("extension") ||
          rawIdea.toLowerCase().includes("extension") ||
          rawIdea.toLowerCase().includes("chrome")
            ? "chrome.storage.local (sandboxed extension storage, zero server setup)"
            : architecture.project_type === "bot" || architecture.project_type === "CLI"
            ? "Local JSON/CSV file on disk (zero server or database setup)"
            : "Browser localStorage (zero server setup)",
        laterOptions: "Cloud database with user accounts (deferred to Level Up Later)",
      },
      partsYouNeedNow: architecture.parts.map((p) => ({ part: p.name, reason: p.one_line_purpose })),
      partsYouCanIgnoreForNow: [
        { part: "User Accounts & Authentication", reason: "First-time testers need instant access with zero sign-up friction." },
        { part: "Cloud Databases & Servers", reason: "Eliminates infrastructure cost and Day 1 configuration stalls." },
        { part: "Analytics & Tracking SDKs", reason: "Does not contribute to the core proof of concept." },
      ],
      mvpVsLater: {
        v1DemoReady: architecture.parts.map((p) => p.name),
        v2Next: ["Export data as JSON or CSV", "Custom sound or micro-animation feedback"],
        v3Future: ["Cloud synchronization across devices", "User accounts and team sharing"],
        outOfScopeWithReasons: [
          { feature: "Real-time multi-tenant collaboration", reason: "Requires WebSocket infrastructure; not needed for individual PoC evaluation." },
          { feature: "Native iOS / Android app distribution", reason: "Desktop/CLI/Web runs immediately with zero compile friction." },
        ],
      },
      nextImplementationSteps: [
        { step: "Add starter fixture items", reason: "Allows someone to test without typing from scratch." },
        { step: "Implement clear empty state", reason: "Shows welcoming guidance when no items exist." },
      ],
    };
    warnings.push("Missing productMap; synthesized from project parameters.");
  }

  // COVERAGE VALIDATOR: Ensure every feature mentioned in summary maps to v1/v2/v3 or out_of_scope
  const summaryLower = summary.toLowerCase();
  const advancedKeywords = [
    { key: "ai categorization", name: "Automatic AI Categorization" },
    { key: "real-time", name: "Real-time Synchronization" },
    { key: "sync across", name: "Cloud Sync Across Devices" },
    { key: "login", name: "User Authentication" },
    { key: "database", name: "Cloud Database" },
  ];

  for (const item of advancedKeywords) {
    if (summaryLower.includes(item.key)) {
      const alreadyInV1 = productMap.mvpVsLater.v1DemoReady.some((f) => f.toLowerCase().includes(item.key));
      const alreadyOut = productMap.mvpVsLater.outOfScopeWithReasons.some((o) => o.feature.toLowerCase().includes(item.key));
      if (!alreadyInV1 && !alreadyOut) {
        productMap.mvpVsLater.outOfScopeWithReasons.push({
          feature: item.name,
          reason: `Excluded from Phase 1 MVP to guarantee a reliable, zero-auth proof of concept.`,
        });
        warnings.push(`Coverage validator: moved '${item.name}' from summary to outOfScopeWithReasons.`);
      }
    }
  }

  // 7. Pitfalls
  let pitfalls: PitfallItem[] = [];
  if (Array.isArray(raw?.pitfalls) && raw.pitfalls.length > 0) {
    pitfalls = raw.pitfalls.map((p: any, idx: number) => ({
      trap: typeof p?.trap === "string" ? p.trap : `Failure mode ${idx + 1}`,
      whyItHappens: typeof p?.whyItHappens === "string" ? p.whyItHappens : "Over-optimizing or skipping verification.",
      howToAvoid: typeof p?.howToAvoid === "string" ? p.howToAvoid : "Implement minimal working prototype first.",
    }));
  } else {
    pitfalls = defaultSkill.pitfalls;
    warnings.push("Missing pitfalls array; populated from domain knowledge.");
  }

  // 8. Roadmap Nodes (Enforcing Size Caps: Max 3 files & max 90 minutes per milestone)
  let nodes: RoadmapNode[] = [];
  let rawNodes = Array.isArray(raw?.nodes) && raw.nodes.length >= 3 ? raw.nodes : null;

  // If raw nodes missing, derive milestones from architecture parts!
  if (!rawNodes) {
    rawNodes = architecture.parts.slice(0, 4).map((p, idx) => {
      const stepNum = idx + 1;
      let files = [`src/${p.id}.ts`];
      if (architecture.project_type === "bot") {
        files =
          stepNum === 1
            ? ["src/bot.ts", "package.json", ".env.example"]
            : stepNum === 2
            ? ["src/commands/deadline.ts"]
            : stepNum === 3
            ? ["src/scheduler.ts"]
            : ["src/storage.ts"];
      } else if (architecture.project_type === "CLI") {
        files =
          stepNum === 1
            ? ["src/parser.ts", "package.json"]
            : stepNum === 2
            ? ["src/calculator.ts"]
            : stepNum === 3
            ? ["src/cli.ts"]
            : ["src/table.ts"];
      }
      return {
        id: `node-${stepNum}`,
        step: stepNum,
        title: p.name,
        subtitle: `${p.side} milestone`,
        badge: stepNum <= 2 ? "CORE MVP" : stepNum === 3 ? "RECOMMENDED" : "POLISH",
        goal: p.one_line_purpose,
        definitionOfDone: [
          `File(s) ${files.join(", ")} exist and compile with zero errors.`,
          p.example_look_feel_function || "Executes cleanly during verification.",
        ],
        conceptToLearn: p.name,
        estimatedMinutes: 45 + stepNum * 10,
        filesToCreate: files,
        keyPackages: architecture.recommended_stack.framework_or_tools.slice(0, 3),
        stepPrompt: `I am building ${projectTitle}. We are executing Step ${stepNum}: ${p.name}.\nPurpose: ${p.one_line_purpose}.\nFiles to create: ${files.join(", ")}.\n\nRULES: Explain your architectural decisions in plain language before writing code. Build ONLY this single milestone and STOP after this step so I can verify the changes.`,
      };
    });
  }

  const isExtension =
    (typeof architecture?.recommended_stack?.language === "string" &&
      architecture.recommended_stack.language.toLowerCase().includes("extension")) ||
    (Array.isArray(architecture?.recommended_stack?.framework_or_tools) &&
      architecture.recommended_stack.framework_or_tools.some((t: any) =>
        String(t).toLowerCase().includes("manifest v3")
      )) ||
    rawIdea.toLowerCase().includes("extension") ||
    rawIdea.toLowerCase().includes("chrome") ||
    rawIdea.toLowerCase().includes("browser add-on") ||
    rawIdea.toLowerCase().includes("browser plugin");

  nodes = rawNodes.slice(0, 4).map((n: any, idx: number) => {
    const stepNum = typeof n?.step === "number" ? n.step : idx + 1;

    // ENFORCE CAP: Max 3 files per milestone
    let files: string[] = Array.isArray(n?.filesToCreate)
      ? n.filesToCreate.filter((f: any) => typeof f === "string" && f.trim().length > 0)
      : [`src/step${stepNum}.ts`];
    if (files.length > 3) {
      warnings.push(`Step ${stepNum} files capped from ${files.length} to 3.`);
      files = files.slice(0, 3);
    }
    if (files.length === 0) files = [`src/step${stepNum}.ts`];

    // ENFORCE CAP: Max 90 minutes per milestone
    let estimatedMinutes = typeof n?.estimatedMinutes === "number" ? n.estimatedMinutes : 45 + stepNum * 10;
    if (estimatedMinutes > 90) {
      warnings.push(`Step ${stepNum} estimated minutes capped to 90.`);
      estimatedMinutes = 90;
    }

    // Definition of Done
    let definitionOfDone: string[] = [];
    if (Array.isArray(n?.definitionOfDone) && n.definitionOfDone.length > 0) {
      definitionOfDone = n.definitionOfDone.map(String).slice(0, 3);
    } else {
      definitionOfDone = [
        `Files ${files.join(", ")} exist with zero syntax or compiler errors.`,
        `Running verification loads without unhandled runtime exceptions.`,
      ];
    }

    // Concept to learn
    const conceptToLearn = typeof n?.conceptToLearn === "string" && n.conceptToLearn.trim().length > 5
      ? n.conceptToLearn.trim()
      : `Step ${stepNum} core architecture mechanics`;

    // Required foundations link
    const requiredFoundations: string[] = Array.isArray(n?.requiredFoundations) && n.requiredFoundations.length > 0
      ? n.requiredFoundations
      : stepNum === 1
      ? ["git_basics", "js_basics"]
      : stepNum === 2
      ? ["storing_data"]
      : ["ai_agent_safety"];

    // Prompt Guard: Enforce "explain decisions" and "stop after this step"
    let basePrompt = typeof n?.stepPrompt === "string" && n.stepPrompt.trim().length > 20
      ? n.stepPrompt.trim()
      : `I am building ${projectTitle}. We are executing Step ${stepNum}. Please create ${files.join(", ")} with complete code.`;

    if (!basePrompt.includes("STOP after this step") && !basePrompt.includes("stop after this step")) {
      basePrompt += `\n\nRULES: Explain your architectural decisions in plain language before writing code. Build ONLY this single milestone and STOP after this step so I can verify the changes.`;
    }

    const rawDocs = Array.isArray(n?.resources) ? n.resources : defaultSkill.docs;
    const sanitizedDocs = rawDocs
      .filter((d: any) => d && typeof d.title === "string")
      .map((d: any) => ({
        title: d.title.trim().replace(/^verified\s+/i, ""),
        url: isValidUrl(d.url) ? d.url.trim() : defaultSkill.docs[0]?.url || "https://developer.mozilla.org",
        isChecked: Boolean(d.isChecked),
      }));

    return {
      id: typeof n?.id === "string" ? n.id : `node-${stepNum}`,
      step: stepNum,
      title: typeof n?.title === "string" ? n.title : `Milestone 0${stepNum}`,
      subtitle: typeof n?.subtitle === "string" ? n.subtitle : "Implementation milestone",
      badge: (n?.badge === "RECOMMENDED" || n?.badge === "POLISH" ? n.badge : "CORE MVP") as
        | "CORE MVP"
        | "RECOMMENDED"
        | "POLISH",
      goal: typeof n?.goal === "string" ? n.goal : "Complete this architectural milestone cleanly.",
      definitionOfDone,
      conceptToLearn,
      estimatedMinutes,
      requiredFoundations,
      filesToCreate: files,
      keyPackages: Array.isArray(n?.keyPackages) ? n.keyPackages : architecture.recommended_stack.framework_or_tools.slice(0, 3),
      stepPrompt: basePrompt,
      resources: sanitizedDocs.length > 0 ? sanitizedDocs : defaultSkill.docs.map(d => ({ ...d, title: d.title.replace(/^verified\s+/i, "") })),
      starterArtifacts:
        Array.isArray(n?.starterArtifacts) && n.starterArtifacts.length > 0
          ? n.starterArtifacts
              .filter(
                (a: any) =>
                  a &&
                  typeof a.filename === "string" &&
                  typeof a.content === "string" &&
                  typeof a.language === "string"
              )
              .map((a: any) => ({
                filename: String(a.filename),
                language: String(a.language),
                content: String(a.content),
                purpose: typeof a.purpose === "string" ? a.purpose : "Starter file for this milestone.",
              }))
          : isExtension && stepNum === 1
          ? createExtensionStarterArtifacts(projectTitle)
          : undefined,
    };
  });

  // 9. Phased Roadmap
  let roadmap: BlueprintPhase[] = nodes.map((n) => ({
    phase: `Phase ${n.step}`,
    title: n.title,
    description: n.goal,
  }));

  // 10. Next Actions
  let nextActions: NextAction[] = nodes.map((n) => ({
    step: n.step,
    action: n.title,
    detail: n.filesToCreate.join(", "),
  }));

  // 11. Tech Stack
  let techStack: StackItem[] = [];
  if (Array.isArray(raw?.techStack) && raw.techStack.length > 0) {
    techStack = raw.techStack.map((s: any) => ({
      category: typeof s?.category === "string" ? s.category : "Technology",
      name: typeof s?.name === "string" ? s.name : "Tool",
      reason: typeof s?.reason === "string" ? s.reason : "Chosen for rapid PoC delivery.",
    }));
  } else {
    techStack = [
      {
        category: "Language & Runtime",
        name: architecture.recommended_stack.language,
        reason: architecture.recommended_stack.why_in_plain_english,
      },
      ...architecture.recommended_stack.framework_or_tools.map((tool) => ({
        category: "Package / Library",
        name: tool,
        reason: "Core lightweight package for this project type.",
      })),
      {
        category: "Storage",
        name:
          architecture.project_type === "bot" || architecture.project_type === "CLI"
            ? "Local JSON / CSV File Storage"
            : "Browser LocalStorage",
        reason: "Zero-database setup; 100% offline-first reliability.",
      },
    ];
  }

  // 12. Resources (Renaming any "Verified" label to "Official Docs")
  const resources = sanitizeResources(raw?.resources || defaultSkill.docs).map((r) => ({
    ...r,
    title: r.title.replace(/^verified\s+/i, ""),
    type: "Official Docs",
  }));

  // 13. Agent Guide
  const rawGuide = raw?.agentGuide || {};
  const agentGuide = {
    workflowTips: Array.isArray(rawGuide.workflowTips) && rawGuide.workflowTips.length > 0
      ? rawGuide.workflowTips.map((t: any) => String(t))
      : [
          "Prompt your coding agent one small file at a time.",
          "Verify the file in your browser or terminal before proceeding to the next step.",
          "Always commit to Git before asking for a large modification.",
        ],
    firstPrompt: typeof rawGuide.firstPrompt === "string" && rawGuide.firstPrompt.trim().length > 30
      ? rawGuide.firstPrompt.trim()
      : `I am building ${projectTitle}. PROJECT GOAL: ${summary}.\n\n` +
        `Let's begin with Step 1: ${nodes[0]?.title}.\n` +
        `Files to create: ${nodes[0]?.filesToCreate.join(", ")}.\n\n` +
        `RULES: Explain your architectural decisions in plain language before writing code. Build ONLY this single milestone and STOP after this step so I can verify the changes.`,
  };

  const isModelBlueprint = Boolean(raw && !raw.isFallback && archResult.isModel);
  const sourceBadges: Record<string, SectionSource> = {
    architecture: archResult.isModel ? "model" : "fallback",
    startHere: isModelBlueprint && raw?.first20Minutes ? "model" : "fallback",
    foundations: "curated",
    productMap: isModelBlueprint && raw?.productMap ? "model" : "fallback",
    milestones: isModelBlueprint && Array.isArray(raw?.nodes) ? "model" : "fallback",
    techStack: isModelBlueprint && Array.isArray(raw?.techStack) ? "model" : "fallback",
    levelUp: "fallback",
    agentGuide: isModelBlueprint && raw?.agentGuide?.firstPrompt ? "model" : "fallback",
  };

  const blueprint: IdeaBlueprint = {
    projectTitle,
    summary,
    strategyDecision,
    architecture,
    first20Minutes,
    foundations: tailoredFoundations,
    productMap,
    pitfalls,
    roadmap,
    nextActions,
    techStack,
    resources,
    agentGuide,
    nodes,
    isFallback: !isModelBlueprint,
    learnerProfile: profile,
    sourceBadges,
  };

  return {
    isValid: warnings.length === 0,
    blueprint,
    warnings,
  };
}

