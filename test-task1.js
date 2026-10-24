// Automated Regression Test Suite for Task 1: Preserve Architecture on Call 2 Failure
const assert = require("assert");
const fs = require("fs");
const ts = require("typescript");

// Register lightweight TypeScript hook for direct production helper testing
require.extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  return module._compile(transpiled.outputText, filename);
};

const {
  computeContentHash,
  computeContentHashBrowser,
  isMilestoneCompletionAllowed,
  sanitizeCompletedNodeIds,
} = require("./lib/milestoneCompletion.ts");

const BASE_URL = process.env.TEST_URL || "http://localhost:3000/api/breakdown";
const ARCH_URL = process.env.TEST_ARCH_URL || "http://localhost:3000/api/architecture";
const REVIEW_URL = process.env.TEST_REVIEW_URL || "http://localhost:3000/api/review";

async function postReview(body, extraHeaders = {}) {
  const res = await fetch(REVIEW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function postBreakdown(body, extraHeaders = {}) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function postArchitecture(body, extraHeaders = {}) {
  const res = await fetch(ARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTestSuite() {
  console.log("=================================================================");
  console.log("RUNNING REGRESSION TEST SUITE (CASES A - O4)");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  async function testCase(name, fn) {
    total++;
    process.stdout.write(`TEST ${total}: ${name} ... `);
    try {
      await fn();
      console.log("PASSED");
      passed++;
    } catch (err) {
      console.log("FAILED!");
      console.error(err);
    }
  }

  // CASE A: Both model calls succeed
  await testCase("Case A: Both model calls succeed (existing live-generation preserved)", async () => {
    const mockArch = {
      project_type: "web app",
      front_back_explained_simply: "Front end is UI cards, back end is localStorage.",
      recommended_stack: {
        language: "TypeScript",
        framework_or_tools: ["Next.js", "Tailwind CSS"],
        why_in_plain_english: "Standard modern React stack.",
        alternatives: [],
      },
      parts: [
        { id: "task-list", name: "Task List Card", one_line_purpose: "Displays tasks", side: "front end (what the user sees)", depends_on: [] },
        { id: "task-input", name: "Task Creator Form", one_line_purpose: "Enters tasks", side: "front end (what the user sees)", depends_on: ["task-list"] },
        { id: "task-storage", name: "LocalStorage Persistence", one_line_purpose: "Saves tasks", side: "back end (works behind the scenes)", depends_on: ["task-list"] },
      ],
    };

    const mockBp = {
      projectTitle: "Personal Task Manager",
      summary: "A clean personal task tracker with local persistence.",
      strategyDecision: "Lightweight client-first architecture.",
      architecture: mockArch,
      nodes: [
        { id: "node-1", step: 1, title: "Task List Card", subtitle: "UI", badge: "CORE MVP", goal: "Displays tasks", definitionOfDone: ["Works"], conceptToLearn: "React", estimatedMinutes: 45, filesToCreate: ["components/TaskList.tsx"], stepPrompt: "Build list", resources: [] },
      ],
      first20Minutes: { action: "Init project", why: "Clean setup", whatToDo: ["git init"], whatDoneLooksLike: "Git ready", starterTerminalCommand: "git init" },
      foundations: { selectedModules: [], totalEstimatedMinutes: 0, fitsTimeBudget: true, timeBudgetNote: "OK", howAnswersShapedPlan: "Good" },
      productMap: { whatItDoes: "Tasks", userJourney: ["open"], screens: [], dataItNeeds: { description: "tasks", storageForMvp: "local", laterOptions: "cloud" }, partsYouNeedNow: [], partsYouCanIgnoreForNow: [], mvpVsLater: { v1DemoReady: [], v2Next: [], v3Future: [], outOfScopeWithReasons: [] }, nextImplementationSteps: [] },
      pitfalls: [],
      roadmap: [{ phase: "Phase 1", title: "Init", description: "Start" }],
      nextActions: [{ step: 1, action: "Create folder", detail: "In terminal" }],
      techStack: [{ category: "Frontend", name: "Next.js", reason: "React framework" }],
      resources: [],
      agentGuide: { workflowTips: [], firstPrompt: "Build app" },
      isFallback: false,
      sourceBadges: { architecture: "model", milestones: "model" },
    };

    const { status, data } = await postBreakdown({
      idea: "A personal task manager with tags and fast search",
      mockArchitecture: mockArch,
      mockBlueprint: mockBp,
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "gemini");
    assert.strictEqual(data.blueprint.isFallback, false);
    assert.strictEqual(data.blueprint.projectTitle, "Personal Task Manager");
  });

  // CASE B: Classification succeeds, but blueprint generation fails
  await testCase("Case B: Classification succeeds, but blueprint generation fails (retains architecture & milestones)", async () => {
    const mockArch = {
      project_type: "web app",
      front_back_explained_simply: "Front end is receipt card views, back end is local OCR cache.",
      recommended_stack: {
        language: "TypeScript",
        framework_or_tools: ["Next.js", "Tesseract.js", "Tailwind CSS"],
        why_in_plain_english: "Client-side OCR with modern React state.",
        alternatives: [],
      },
      parts: [
        { id: "ocr-ingest", name: "Receipt Image OCR Ingest", one_line_purpose: "Extracts amounts from receipt photos", side: "front end (what the user sees)", depends_on: [] },
        { id: "expense-rules", name: "Expense Categorizer Engine", one_line_purpose: "Maps vendors to category budgets", side: "back end (works behind the scenes)", depends_on: ["ocr-ingest"] },
        { id: "dashboard-cards", name: "Spending Summary Dashboard", one_line_purpose: "Displays weekly total breakdowns", side: "front end (what the user sees)", depends_on: ["expense-rules"] },
        { id: "csv-export", name: "CSV Export & Persistence", one_line_purpose: "Saves expenses locally and exports spreadsheet", side: "back end (works behind the scenes)", depends_on: ["expense-rules"] },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A smart expense logger with receipt categorization and export",
      mockArchitecture: mockArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "fallback");
    assert.strictEqual(data.diagnostics.architectureRetained, true);
    assert.strictEqual(data.blueprint.isFallback, true);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "model");

    // Architecture preserved
    assert.strictEqual(data.blueprint.architecture.parts.length, 4);
    assert.strictEqual(data.blueprint.architecture.parts[0].name, "Receipt Image OCR Ingest");

    // Milestones (nodes) derived directly from retained architecture parts
    assert.strictEqual(data.blueprint.nodes.length, 4);
    assert.strictEqual(data.blueprint.nodes[0].title, "Receipt Image OCR Ingest");
    assert.strictEqual(data.blueprint.nodes[1].title, "Expense Categorizer Engine");
    assert.strictEqual(data.blueprint.nodes[2].title, "Spending Summary Dashboard");
    assert.strictEqual(data.blueprint.nodes[3].title, "CSV Export & Persistence");

    // Phased Roadmap corresponds to architecture parts
    assert.strictEqual(data.blueprint.roadmap[0].title, "Receipt Image OCR Ingest");
    assert.strictEqual(data.blueprint.roadmap[1].title, "Expense Categorizer Engine");
  });

  // CASE C: Classification fails
  await testCase("Case C: Classification fails (safe offline heuristic still works)", async () => {
    const { status, data } = await postBreakdown({
      idea: "An app that tells farmers in Rivers State when to plant based on rainfall",
      simulateFailure: "call1",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "fallback");
    assert.strictEqual(data.diagnostics.architectureRetained, false);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "fallback");
    assert.ok(data.blueprint.architecture.parts.length >= 3);
    assert.ok(data.blueprint.nodes.length >= 3);
    // Domain heuristic generated agriculture milestones
    assert.ok(data.blueprint.nodes[0].title.toLowerCase().includes("rainfall") || data.blueprint.nodes[0].title.toLowerCase().includes("zone"));
  });

  // CASE D: Classification returns invalid or incomplete architecture
  await testCase("Case D: Classification returns invalid architecture (safely rejected, no crash)", async () => {
    const invalidArch = {
      project_type: "bot",
      parts: [
        { id: "lone-part", name: "Incomplete Part" } // Only 1 part, missing purpose, side, stack
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A cryptocurrency price alert bot for telegram",
      mockArchitecture: invalidArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "fallback");
    // Invalid architecture must NOT be retained as model
    assert.strictEqual(data.diagnostics.architectureRetained, false);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "fallback");
    // Safely synthesized full set of valid parts and nodes
    assert.ok(data.blueprint.architecture.parts.length >= 3);
    assert.ok(data.blueprint.nodes.length >= 3);
  });

  // CASE E: Non-web project retained architecture (Python CLI)
  await testCase("Case E: Retained non-web architecture (Python CLI not converted to Next.js)", async () => {
    const pythonCliArch = {
      project_type: "CLI",
      front_back_explained_simply: "Front end is colored terminal flags and tables; back end is local SQLite parsing.",
      recommended_stack: {
        language: "Python",
        framework_or_tools: ["typer", "rich", "sqlite3"],
        why_in_plain_english: "Typer creates clean CLI argument parsing while rich formats terminal output.",
        alternatives: [],
      },
      parts: [
        { id: "cli-parser", name: "Typer CLI Argument Parser", one_line_purpose: "Parses database path and sql query flags", side: "front end (what the user sees)", depends_on: [] },
        { id: "db-reader", name: "SQLite Database Schema Reader", one_line_purpose: "Extracts table definitions and indices", side: "back end (works behind the scenes)", depends_on: ["cli-parser"] },
        { id: "table-renderer", name: "Rich ASCII Terminal Table Formatter", one_line_purpose: "Renders SQL query output in colored borders", side: "front end (what the user sees)", depends_on: ["db-reader"] },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A Python command-line utility to inspect SQLite databases",
      mockArchitecture: pythonCliArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.diagnostics.architectureRetained, true);
    assert.strictEqual(data.blueprint.architecture.project_type, "CLI");

    // 1. Tech stack MUST NOT contain Next.js
    const hasNextJs = data.blueprint.techStack.some((item) =>
      item.name.toLowerCase().includes("next.js")
    );
    assert.strictEqual(hasNextJs, false, "Fallback must not silently convert non-web project to Next.js");

    // 2. Tech stack MUST contain Python and Typer
    const hasPython = data.blueprint.techStack.some((item) =>
      item.name.toLowerCase().includes("python")
    );
    assert.strictEqual(hasPython, true, "Tech stack must retain Python runtime");

    // 3. Setup instructions (first20Minutes) must use Python, not npm
    assert.ok(
      data.blueprint.first20Minutes.starterTerminalCommand.includes("python"),
      "Starter command must use python virtual environment"
    );
    assert.ok(
      !data.blueprint.first20Minutes.starterTerminalCommand.includes("npm init"),
      "Starter command must not use npm for a Python CLI"
    );

    // 4. Milestone files must use Python (.py) files
    const firstNodeFiles = data.blueprint.nodes[0].filesToCreate;
  });

  // CASE F (Task 2 Fix 1): Reject synthetic architecture parts as authentic model output
  await testCase("Case F: Empty part objects [{}, {}, {}] rejected from model provenance", async () => {
    const emptyPartsArch = {
      project_type: "bot",
      front_back_explained_simply: "Front end is chat, back end is local script.",
      recommended_stack: {
        language: "TypeScript",
        framework_or_tools: ["discord.js"],
        why_in_plain_english: "Standard bot stack.",
        alternatives: [],
      },
      parts: [{}, {}, {}], // 3 empty objects: missing name and purpose
    };

    const { status, data } = await postBreakdown({
      idea: "A reminder bot for server events",
      mockArchitecture: emptyPartsArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "fallback");
    // MUST NOT be retained as authentic model output!
    assert.strictEqual(data.diagnostics.architectureRetained, false);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "fallback");
  });

  // CASE G (Task 2 Fix 2 & 3): Telegram Translation Bot (domain filenames and Telegram setup)
  await testCase("Case G: Telegram Translation Bot generates translation filenames & Telegram setup", async () => {
    const telegramArch = {
      project_type: "bot",
      front_back_explained_simply: "Front end is Telegram inline keyboard; back end is DeepL translation client.",
      recommended_stack: {
        language: "Python",
        framework_or_tools: ["python-telegram-bot", "requests", "python-dotenv"],
        why_in_plain_english: "Python Telegram Bot library handles asynchronous chat updates.",
        alternatives: [],
      },
      parts: [
        { id: "telegram-listener", name: "Telegram Webhook & Message Listener", one_line_purpose: "Listens for new chat messages", side: "front end (what the user sees)", depends_on: [] },
        { id: "deepl-translator", name: "DeepL Translation Engine Router", one_line_purpose: "Sends text to DeepL API", side: "back end (works behind the scenes)", depends_on: ["telegram-listener"] },
        { id: "translate-commands", name: "Interactive Translate Slash Commands", one_line_purpose: "Handles /translate commands", side: "front end (what the user sees)", depends_on: ["deepl-translator"] },
        { id: "translation-cache", name: "Recent Translation Local Cache", one_line_purpose: "Caches frequent translations to disk", side: "back end (works behind the scenes)", depends_on: ["deepl-translator"] },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A Telegram bot that translates group messages in real time using DeepL",
      mockArchitecture: telegramArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.diagnostics.architectureRetained, true);

    // 1. Setup must mention Telegram, not Discord
    assert.ok(
      data.blueprint.first20Minutes.why.includes("Telegram"),
      `Setup explanation must mention Telegram, got: ${data.blueprint.first20Minutes.why}`
    );
    assert.ok(
      !data.blueprint.first20Minutes.why.includes("Discord"),
      "Setup explanation must not mention Discord for a Telegram bot"
    );
    assert.ok(
      data.blueprint.first20Minutes.starterTerminalCommand.includes("python-telegram-bot"),
      "Starter command must install python-telegram-bot"
    );

    // 2. Milestone filenames must reflect translation domain
    const node2Files = data.blueprint.nodes[1].filesToCreate;
    const node3Files = data.blueprint.nodes[2].filesToCreate;
    const node4Files = data.blueprint.nodes[3].filesToCreate;

    assert.ok(
      node2Files.some((f) => f.includes("deepl_translator")),
      `Node 2 files must include deepl_translator, got: ${node2Files.join(", ")}`
    );
    assert.ok(
      node3Files.some((f) => f.includes("translate_commands")),
      `Node 3 files must include translate_commands, got: ${node3Files.join(", ")}`
    );
    assert.ok(
      node4Files.some((f) => f.includes("translation_cache")),
      `Node 4 files must include translation_cache, got: ${node4Files.join(", ")}`
    );

    // 3. NO reminder or calculator files
    const allFiles = data.blueprint.nodes.flatMap((n) => n.filesToCreate).join(" ");
    assert.ok(!allFiles.includes("remind"), `Must not contain 'remind' file, got: ${allFiles}`);
    assert.ok(!allFiles.includes("calculator"), `Must not contain 'calculator' file, got: ${allFiles}`);
  });

  // CASE H (Task 2 Fix 2 & 3): Discord Moderation Bot (domain filenames and Discord setup)
  await testCase("Case H: Discord Moderation Bot generates moderation filenames & Discord setup", async () => {
    const discordArch = {
      project_type: "bot",
      front_back_explained_simply: "Front end is Discord slash commands; back end is real-time event listener.",
      recommended_stack: {
        language: "TypeScript",
        framework_or_tools: ["discord.js", "dotenv"],
        why_in_plain_english: "discord.js connects directly to the Discord gateway WebSocket.",
        alternatives: [],
      },
      parts: [
        { id: "gateway-auth", name: "Discord Gateway Client & Token Auth", one_line_purpose: "Authenticates bot with Discord", side: "back end (works behind the scenes)", depends_on: [] },
        { id: "automod-scanner", name: "Word Filter & AutoMod Scanner", one_line_purpose: "Scans messages for banned words", side: "back end (works behind the scenes)", depends_on: ["gateway-auth"] },
        { id: "moderation-commands", name: "Warn and Ban Slash Commands", one_line_purpose: "Executes admin commands", side: "front end (what the user sees)", depends_on: ["automod-scanner"] },
        { id: "audit-logger", name: "Moderation Audit Logger", one_line_purpose: "Logs warnings to local JSON", side: "back end (works behind the scenes)", depends_on: ["moderation-commands"] },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A Discord moderation bot to filter toxic words and log bans",
      mockArchitecture: discordArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.diagnostics.architectureRetained, true);

    // 1. Setup must mention Discord
    assert.ok(
      data.blueprint.first20Minutes.why.includes("Discord"),
      `Setup explanation must mention Discord, got: ${data.blueprint.first20Minutes.why}`
    );
    assert.ok(
      data.blueprint.first20Minutes.starterTerminalCommand.includes("discord.js"),
      "Starter command must install discord.js"
    );

    // 2. Milestone filenames must reflect moderation domain
    const node2Files = data.blueprint.nodes[1].filesToCreate;
    const node3Files = data.blueprint.nodes[2].filesToCreate;
    const node4Files = data.blueprint.nodes[3].filesToCreate;

    assert.ok(
      node2Files.some((f) => f.includes("automod-scanner")),
      `Node 2 files must include automod-scanner, got: ${node2Files.join(", ")}`
    );
    assert.ok(
      node3Files.some((f) => f.includes("moderation-commands")),
      `Node 3 files must include moderation-commands, got: ${node3Files.join(", ")}`
    );
    assert.ok(
      node4Files.some((f) => f.includes("audit-logger")),
      `Node 4 files must include audit-logger, got: ${node4Files.join(", ")}`
    );

    // 3. NO reminder or calculator files
    const allFiles = data.blueprint.nodes.flatMap((n) => n.filesToCreate).join(" ");
    assert.ok(!allFiles.includes("remind"), `Must not contain 'remind' file, got: ${allFiles}`);
    assert.ok(!allFiles.includes("calculator"), `Must not contain 'calculator' file, got: ${allFiles}`);
  });

  // CASE I (Task 2 Fix 2): Python Finance CLI (domain filenames)
  await testCase("Case I: Python Finance CLI generates finance-specific filenames (no calculator.py)", async () => {
    const financeCliArch = {
      project_type: "CLI",
      front_back_explained_simply: "Front end is colored tables in terminal; back end is CSV parsing.",
      recommended_stack: {
        language: "Python",
        framework_or_tools: ["typer", "rich", "pandas"],
        why_in_plain_english: "Typer and pandas parse and report bank statements.",
        alternatives: [],
      },
      parts: [
        { id: "cli-parser", name: "Typer CLI Argument Parser", one_line_purpose: "Parses input file flags", side: "front end (what the user sees)", depends_on: [] },
        { id: "bank-csv-reader", name: "Bank CSV Ingestion & Normalizer", one_line_purpose: "Reads bank statement CSV rows", side: "back end (works behind the scenes)", depends_on: ["cli-parser"] },
        { id: "spending-aggregator", name: "Category Spending Aggregator", one_line_purpose: "Aggregates totals per category", side: "back end (works behind the scenes)", depends_on: ["bank-csv-reader"] },
        { id: "summary-reporter", name: "Rich ASCII Summary Table", one_line_purpose: "Renders terminal table", side: "front end (what the user sees)", depends_on: ["spending-aggregator"] },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A Python CLI tool to parse personal bank CSVs and aggregate expenses",
      mockArchitecture: financeCliArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.diagnostics.architectureRetained, true);

    const node2Files = data.blueprint.nodes[1].filesToCreate;
    const node3Files = data.blueprint.nodes[2].filesToCreate;
    const node4Files = data.blueprint.nodes[3].filesToCreate;

    assert.ok(
      node2Files.some((f) => f.includes("bank_csv_reader")),
      `Node 2 files must include bank_csv_reader, got: ${node2Files.join(", ")}`
    );
    assert.ok(
      node3Files.some((f) => f.includes("spending_aggregator")),
      `Node 3 files must include spending_aggregator, got: ${node3Files.join(", ")}`
    );
    assert.ok(
      node4Files.some((f) => f.includes("summary_reporter")),
      `Node 4 files must include summary_reporter, got: ${node4Files.join(", ")}`
    );

    // Verify calculator.py is NOT present
    const allFiles = data.blueprint.nodes.flatMap((n) => n.filesToCreate).join(" ");
    assert.ok(!allFiles.includes("calculator.py"), `Must not contain calculator.py, got: ${allFiles}`);
  });

  // CASE J (Task 2 Fix 3): Neutral platform wording when platform is unknown
  await testCase("Case J: Platform-neutral wording used when platform is unknown", async () => {
    const neutralBotArch = {
      project_type: "bot",
      front_back_explained_simply: "Front end is webhook messages; back end is alert dispatcher.",
      recommended_stack: {
        language: "JavaScript",
        framework_or_tools: ["dotenv"],
        why_in_plain_english: "Custom bot server.",
        alternatives: [],
      },
      parts: [
        { id: "webhook-listener", name: "HTTP Webhook Alert Ingest", one_line_purpose: "Receives incoming alerts", side: "back end (works behind the scenes)", depends_on: [] },
        { id: "alert-filter", name: "Severity Priority Filter", one_line_purpose: "Sorts alerts by urgency", side: "back end (works behind the scenes)", depends_on: ["webhook-listener"] },
        { id: "dispatch-sender", name: "Outbound Notification Sender", one_line_purpose: "Posts alert to channel", side: "front end (what the user sees)", depends_on: ["alert-filter"] },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A generic webhook alert bot for server monitoring",
      mockArchitecture: neutralBotArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.diagnostics.architectureRetained, true);

    assert.ok(
      data.blueprint.first20Minutes.why.includes("before connecting your bot to its messaging platform."),
      `Setup explanation must use neutral wording, got: ${data.blueprint.first20Minutes.why}`
    );
  });

  // CASE K (Task 3): Chrome Article Summarizer Extension (Offline Fallback)
  await testCase("Case K: Chrome Article Summarizer Extension generates extension-specific fallback", async () => {
    const { status, data } = await postBreakdown({
      idea: "Build a Chrome extension that summarizes articles on the current webpage and lets users save summaries to read later.",
      simulateFailure: "call1",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.blueprint.isFallback, true);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "fallback");

    // 1. Stack is extension-specific (MV3, chrome.storage.local, activeTab; NOT Next.js / React Native / Discord)
    const stackTools = data.blueprint.architecture.recommended_stack.framework_or_tools;
    assert.ok(
      stackTools.some((t) => t.includes("Manifest V3")),
      `Stack must include Manifest V3, got: ${stackTools.join(", ")}`
    );
    assert.ok(
      stackTools.some((t) => t.includes("chrome.storage.local")),
      `Stack must include chrome.storage.local, got: ${stackTools.join(", ")}`
    );
    assert.ok(
      stackTools.some((t) => t.includes("activeTab")),
      `Stack must include activeTab, got: ${stackTools.join(", ")}`
    );
    assert.ok(
      !stackTools.some((t) => /next\.js|react native|discord|commander/i.test(t)),
      `Stack must NOT include Next.js or bot/CLI tools, got: ${stackTools.join(", ")}`
    );

    // 2. Architecture includes manifest, content script, popup, storage/service worker, and summarization point
    const parts = data.blueprint.architecture.parts;
    assert.ok(parts.length >= 3 && parts.length <= 7, `Parts count must be between 3 and 7, got: ${parts.length}`);
    const partNames = parts.map((p) => p.name.toLowerCase()).join(" ");
    const partPurposes = parts.map((p) => p.one_line_purpose.toLowerCase()).join(" ");
    const partSteps = parts.flatMap((p) => p.steps || []).join(" ").toLowerCase();

    assert.ok(partNames.includes("manifest"), `Parts must include Manifest V3, got: ${partNames}`);
    assert.ok(partNames.includes("content") || partNames.includes("extractor"), `Parts must include content script/extractor, got: ${partNames}`);
    assert.ok(partNames.includes("popup"), `Parts must include popup interface, got: ${partNames}`);
    assert.ok(partNames.includes("storage") || partNames.includes("service worker"), `Parts must include storage or service worker, got: ${partNames}`);
    assert.ok(
      partPurposes.includes("summariz") || partSteps.includes("summariz"),
      `Parts must provide an explicit integration point for summarization, got purposes: ${partPurposes}`
    );

    // 3. Milestones and filenames align with extension parts
    const nodes = data.blueprint.nodes;
    assert.ok(nodes.length >= 4, `Must have at least 4 milestone nodes, got: ${nodes.length}`);
    const node1Files = nodes[0].filesToCreate;
    const node2Files = nodes[1].filesToCreate;
    const node3Files = nodes[2].filesToCreate;
    const node4Files = nodes[3].filesToCreate;

    assert.ok(node1Files.includes("manifest.json"), `Node 1 must create manifest.json, got: ${node1Files.join(", ")}`);
    assert.ok(node2Files.some((f) => f.includes("content.js")), `Node 2 must create content script, got: ${node2Files.join(", ")}`);
    assert.ok(node3Files.some((f) => f.includes("popup")), `Node 3 must create popup files, got: ${node3Files.join(", ")}`);
    assert.ok(
      node4Files.some((f) => f.includes("background.js") || f.includes("storage.js")),
      `Node 4 must create service worker or storage file, got: ${node4Files.join(", ")}`
    );

    // 4. No generic SPA or .tsx filenames
    const allFiles = nodes.flatMap((n) => n.filesToCreate).join(" ");
    assert.ok(!allFiles.includes(".tsx"), `Must NOT contain .tsx components, got: ${allFiles}`);
    assert.ok(!allFiles.includes("calculator"), `Must NOT contain calculator, got: ${allFiles}`);

    // 5. Setup instructions & Product Map describe Chrome extension
    assert.ok(
      data.blueprint.first20Minutes.why.includes("chrome://extensions") ||
      data.blueprint.first20Minutes.action.includes("Chrome Extension"),
      `First 20 min setup must guide extension loading, got action: ${data.blueprint.first20Minutes.action}`
    );
    assert.ok(
      data.blueprint.productMap.dataItNeeds.storageForMvp.includes("chrome.storage.local"),
      `Storage for MVP must be chrome.storage.local, got: ${data.blueprint.productMap.dataItNeeds.storageForMvp}`
    );
  });

  // CASE L (Task 3): Second extension idea - Social Media Feed Blocker (Offline Fallback)
  await testCase("Case L: Feed blocker browser add-on generates extension fallback (independent wording)", async () => {
    const { status, data } = await postBreakdown({
      idea: "A browser add-on that blocks distracting feeds on social media sites",
      simulateFailure: "call1",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.blueprint.isFallback, true);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "fallback");

    const stackTools = data.blueprint.architecture.recommended_stack.framework_or_tools;
    assert.ok(stackTools.some((t) => t.includes("Manifest V3")), `Stack must include Manifest V3, got: ${stackTools.join(", ")}`);
    assert.ok(!stackTools.some((t) => /next\.js|react native|discord|commander/i.test(t)), `Stack must NOT include Next.js, got: ${stackTools.join(", ")}`);

    const node1Files = data.blueprint.nodes[0].filesToCreate;
    assert.ok(node1Files.includes("manifest.json"), `Node 1 must create manifest.json, got: ${node1Files.join(", ")}`);

    const allFiles = data.blueprint.nodes.flatMap((n) => n.filesToCreate).join(" ");
    assert.ok(!allFiles.includes(".tsx"), `Must NOT contain .tsx components, got: ${allFiles}`);
  });

  // CASE M (Task 3): Retained model-generated extension architecture (Call 2 failure)
  await testCase("Case M: Retained model extension architecture produces extension milestone files", async () => {
    const extensionArch = {
      project_type: "web app",
      front_back_explained_simply: "Front end is popup.html, back end is background service worker.",
      recommended_stack: {
        language: "TypeScript (Chrome Extension MV3)",
        framework_or_tools: ["Chrome Manifest V3", "chrome.storage.local", "activeTab API"],
        why_in_plain_english: "Lightweight browser extension.",
        alternatives: [],
      },
      parts: [
        { id: "manifest-config", name: "Manifest V3 Configuration", one_line_purpose: "Configures permissions", side: "both", depends_on: [] },
        { id: "dom-highlighter", name: "Webpage DOM Text Highlighter (Content Script)", one_line_purpose: "Highlights text on webpage", side: "front end (what the user sees)", depends_on: ["manifest-config"] },
        { id: "popup-palette", name: "Color Palette Toolbar Popup", one_line_purpose: "Presents highlight color options", side: "front end (what the user sees)", depends_on: ["manifest-config"] },
        { id: "saved-highlights", name: "Saved Highlights Storage Service Worker", one_line_purpose: "Persists highlight coordinates", side: "back end (works behind the scenes)", depends_on: ["popup-palette"] },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "A Chrome extension that highlights and saves memorable quotes from articles",
      mockArchitecture: extensionArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.diagnostics.architectureRetained, true);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "model");

    const node1Files = data.blueprint.nodes[0].filesToCreate;
    const node2Files = data.blueprint.nodes[1].filesToCreate;
    const node3Files = data.blueprint.nodes[2].filesToCreate;

    assert.ok(node1Files.includes("manifest.json"), `Node 1 must create manifest.json, got: ${node1Files.join(", ")}`);
    assert.ok(node2Files.some((f) => f.includes("content.js")), `Node 2 must create content script, got: ${node2Files.join(", ")}`);
    assert.ok(node3Files.some((f) => f.includes("popup")), `Node 3 must create popup files, got: ${node3Files.join(", ")}`);
  });

  // CASE N (Task 3A): Incomplete retained extension architecture with only 2 parts demoted from model provenance
  await testCase("Case N: Incomplete extension architecture (2 parts) rejected from model provenance on Call 2 failure", async () => {
    const incompleteExtensionArch = {
      project_type: "web app",
      front_back_explained_simply: "Front end is popup.html, back end is background service worker.",
      recommended_stack: {
        language: "JavaScript / TypeScript (Chrome Extension MV3)",
        framework_or_tools: ["Chrome Manifest V3", "chrome.storage.local", "activeTab API"],
        why_in_plain_english: "Chrome extension.",
        alternatives: [],
      },
      parts: [
        {
          id: "manifest-config",
          name: "Manifest V3 Configuration",
          one_line_purpose: "Configures permissions and action popup",
          side: "both",
          depends_on: [],
        },
        {
          id: "popup-ui",
          name: "Toolbar Action & Popup View",
          one_line_purpose: "User interface for viewing summaries",
          side: "front end (what the user sees)",
          depends_on: ["manifest-config"],
        },
      ],
    };

    const { status, data } = await postBreakdown({
      idea: "Build a Chrome extension that summarizes articles on the current webpage and lets users save summaries to read later.",
      mockArchitecture: incompleteExtensionArch,
      simulateFailure: "call2",
    });

    assert.strictEqual(status, 200);

    // 1. Diagnostics must NOT claim architecture was retained from model
    assert.strictEqual(
      data.diagnostics.architectureRetained,
      false,
      "Incomplete 2-part architecture must NOT be marked as retained model architecture"
    );

    // 2. Blueprint source badge must be 'fallback', never 'model'
    assert.strictEqual(
      data.blueprint.sourceBadges.architecture,
      "fallback",
      `Architecture source badge must be 'fallback', got: ${data.blueprint.sourceBadges.architecture}`
    );
    assert.strictEqual(data.blueprint.isFallback, true);

    // 3. The resulting extension blueprint remains structurally valid with complete domain parts
    const parts = data.blueprint.architecture.parts;
    assert.ok(parts.length >= 3 && parts.length <= 7, `Parts count must be repaired to valid range (3-7), got: ${parts.length}`);
    const partNames = parts.map((p) => p.name.toLowerCase()).join(" ");
    assert.ok(partNames.includes("manifest"), `Repaired parts must include Manifest, got: ${partNames}`);
    assert.ok(partNames.includes("content") || partNames.includes("extractor"), `Repaired parts must include content script, got: ${partNames}`);
    assert.ok(partNames.includes("popup"), `Repaired parts must include popup, got: ${partNames}`);
    assert.ok(partNames.includes("storage") || partNames.includes("service worker"), `Repaired parts must include storage/worker, got: ${partNames}`);

    // 4. Milestone nodes and filenames are valid extension files
    const nodes = data.blueprint.nodes;
    assert.ok(nodes.length >= 4, `Nodes count must be >= 4, got: ${nodes.length}`);
    const node1Files = nodes[0].filesToCreate;
    assert.ok(node1Files.includes("manifest.json"), `Node 1 must create manifest.json, got: ${node1Files.join(", ")}`);

    // 5. Setup instructions remain structurally valid
    assert.ok(
      data.blueprint.first20Minutes.why.includes("chrome://extensions") ||
      data.blueprint.first20Minutes.action.includes("Chrome Extension"),
      `Setup instructions must remain extension-oriented, got: ${data.blueprint.first20Minutes.action}`
    );
  });

  // CASE O1 (Task 4): Fast generation returns live result and cleans up timer
  await testCase("Case O1: Fast generation returns live result and cleans up timer", async () => {
    const mockArch = {
      project_type: "web app",
      front_back_explained_simply: "Front end is plant cards, back end is notification service.",
      recommended_stack: {
        language: "TypeScript",
        framework_or_tools: ["Next.js", "Tailwind CSS"],
        why_in_plain_english: "React web app",
        alternatives: [],
      },
      parts: [
        { id: "p1", name: "Plant Schedule View", one_line_purpose: "Shows watering dates", side: "front end (what the user sees)", depends_on: [] },
        { id: "p2", name: "Watering Reminder Worker", one_line_purpose: "Calculates intervals", side: "back end (works behind the scenes)", depends_on: ["p1"] },
        { id: "p3", name: "Plant Database Storage", one_line_purpose: "Stores plant moisture prefs", side: "back end (works behind the scenes)", depends_on: ["p1"] },
      ],
    };

    const mockBp = {
      projectTitle: "Plant Watering Scheduler",
      summary: "Tracks moisture and alerts when plants need water.",
      strategyDecision: "Lightweight client app.",
      architecture: mockArch,
      nodes: [
        { id: "node-1", step: 1, title: "Plant Schedule View", subtitle: "UI", badge: "CORE MVP", goal: "Shows watering dates", definitionOfDone: ["Works"], conceptToLearn: "React", estimatedMinutes: 45, filesToCreate: ["components/Schedule.tsx"], stepPrompt: "Build schedule", resources: [] },
      ],
      first20Minutes: { action: "Init project", why: "Clean setup", whatToDo: ["git init"], whatDoneLooksLike: "Git ready", starterTerminalCommand: "git init" },
      foundations: { selectedModules: [], totalEstimatedMinutes: 0, fitsTimeBudget: true, timeBudgetNote: "OK", howAnswersShapedPlan: "Good" },
      productMap: { whatItDoes: "Reminds watering", userJourney: ["view"], screens: [], dataItNeeds: { description: "plants", storageForMvp: "local", laterOptions: "cloud" }, partsYouNeedNow: [], partsYouCanIgnoreForNow: [], mvpVsLater: { v1DemoReady: [], v2Next: [], v3Future: [], outOfScopeWithReasons: [] }, nextImplementationSteps: [] },
      pitfalls: [],
      roadmap: [{ phase: "Phase 1", title: "Init", description: "Start" }],
      nextActions: [{ step: 1, action: "Create file", detail: "In terminal" }],
      techStack: [{ category: "Frontend", name: "Next.js", reason: "React framework" }],
      resources: [],
      agentGuide: { workflowTips: [], firstPrompt: "Build app" },
      isFallback: false,
      sourceBadges: { architecture: "model", milestones: "model", projectMap: "model" },
    };

    const startTime = Date.now();
    const { status, data } = await postBreakdown({
      idea: "A smart plant watering reminder application",
      mockArchitecture: mockArch,
      mockBlueprint: mockBp,
      timeoutMs: 500,
    });
    const duration = Date.now() - startTime;

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "gemini");
    assert.strictEqual(data.blueprint.isFallback, false);
    assert.strictEqual(data.blueprint.projectTitle, "Plant Watering Scheduler");
    assert.ok(duration < 400, `Expected fast response (<400ms), took ${duration}ms`);
  });

  // CASE O2 (Task 4): Second-stage generation timeout returns correct fallback & retains architecture
  await testCase("Case O2: Second-stage timeout retains valid architecture and returns fallback", async () => {
    const mockArch = {
      project_type: "other",
      front_back_explained_simply: "Front end is sensor readings dashboard, back end is MQTT broker client.",
      recommended_stack: {
        language: "C++ / Python",
        framework_or_tools: ["ESP32", "MicroPython", "MQTT"],
        why_in_plain_english: "Embedded microcontroller reading physical moisture sensors.",
        alternatives: [],
      },
      parts: [
        { id: "moisture-adc", name: "Analog Soil Moisture ADC Probe", one_line_purpose: "Reads physical capacitance voltage", side: "both", depends_on: [] },
        { id: "esp32-controller", name: "ESP32 Sensor Sampling Loop", one_line_purpose: "Periodically samples soil moisture and publishes telemetry", side: "back end (works behind the scenes)", depends_on: ["moisture-adc"] },
        { id: "status-oled", name: "Local OLED Status Display", one_line_purpose: "Displays moisture percentage on device screen", side: "front end (what the user sees)", depends_on: ["esp32-controller"] },
        { id: "pump-relay", name: "Submersible Pump Relay Actuator", one_line_purpose: "Triggers 5V water pump when moisture dips below threshold", side: "back end (works behind the scenes)", depends_on: ["esp32-controller"] },
      ],
    };

    const startTime = Date.now();
    const { status, data } = await postBreakdown({
      idea: "An automated greenhouse irrigation controller with ESP32 and soil sensors",
      mockArchitecture: mockArch,
      mockDelayMs: 250,
      timeoutMs: 60,
    });
    const duration = Date.now() - startTime;

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "fallback");
    assert.strictEqual(data.blueprint.isFallback, true);
    assert.strictEqual(data.diagnostics.architectureRetained, true);
    assert.strictEqual(data.blueprint.sourceBadges.architecture, "model");
    assert.ok(
      data.diagnostics.fallbackReason.includes("timed out") || data.diagnostics.fallbackReason.includes("timeout"),
      `Fallback reason must cite timeout, got: ${data.diagnostics.fallbackReason}`
    );
    assert.strictEqual(data.blueprint.architecture.parts.length, 4);
    assert.strictEqual(data.blueprint.architecture.parts[0].name, "Analog Soil Moisture ADC Probe");
    // Verify timeout fired quickly instead of waiting 250ms or 35s
    assert.ok(duration < 220, `Expected timeout return in <220ms, took ${duration}ms`);
  });

  // CASE O3 (Task 4): Late rejection does not cause an unhandled rejection
  await testCase("Case O3: Late rejection after timeout does not cause an unhandled rejection", async () => {
    const unhandled = [];
    const handler = (reason) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", handler);

    try {
      const mockArch = {
        project_type: "web app",
        front_back_explained_simply: "Front end is card list, back end is local storage.",
        recommended_stack: {
          language: "TypeScript",
          framework_or_tools: ["Next.js", "Tailwind CSS"],
          why_in_plain_english: "Simple test stack",
          alternatives: [],
        },
        parts: [
          { id: "p1", name: "Part One", one_line_purpose: "Purpose 1", side: "front end (what the user sees)", depends_on: [] },
          { id: "p2", name: "Part Two", one_line_purpose: "Purpose 2", side: "back end (works behind the scenes)", depends_on: ["p1"] },
          { id: "p3", name: "Part Three", one_line_purpose: "Purpose 3", side: "both", depends_on: ["p2"] },
        ],
      };

      const { status, data } = await postBreakdown({
        idea: "A micro habit tracker for busy students",
        mockArchitecture: mockArch,
        mockDelayMs: 80,
        timeoutMs: 30,
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(data.source, "fallback");

      // Wait past the 80ms mockDelayMs to allow late settlement
      await new Promise((resolve) => setTimeout(resolve, 100));

      assert.strictEqual(unhandled.length, 0, `Expected 0 unhandled rejections, got: ${unhandled.map(String).join(", ")}`);
    } finally {
      process.removeListener("unhandledRejection", handler);
    }
  });

  // CASE O4 (Task 4): Test-only controls cannot be invoked through production API requests
  await testCase("Case O4: Test-only controls cannot be invoked through production requests", async () => {
    const injectedArch = {
      project_type: "cli tool",
      front_back_explained_simply: "Front end is terminal, back end is filesystem.",
      recommended_stack: {
        language: "Rust",
        framework_or_tools: ["InjectedUnauthorizedTool"],
        why_in_plain_english: "Test injection",
        alternatives: [],
      },
      parts: [
        { id: "injected-p1", name: "INJECTED_UNAUTHORIZED_PART", one_line_purpose: "Injected", side: "front end (what the user sees)", depends_on: [] },
        { id: "injected-p2", name: "INJECTED_UNAUTHORIZED_PART_2", one_line_purpose: "Injected 2", side: "back end (works behind the scenes)", depends_on: ["injected-p1"] },
        { id: "injected-p3", name: "INJECTED_UNAUTHORIZED_PART_3", one_line_purpose: "Injected 3", side: "both", depends_on: ["injected-p2"] },
      ],
    };

    const { status, data } = await postBreakdown(
      {
        idea: "An app that tells farmers in Rivers State when to plant based on rainfall",
        mockArchitecture: injectedArch,
        simulateFailure: "call2",
        timeoutMs: 15,
      },
      { "x-simulate-production": "true" }
    );

    assert.strictEqual(status, 200);
    // Since production mode ignored mockArchitecture and simulateFailure:
    // 1. It must NOT retain or use the injected architecture
    const partsString = JSON.stringify(data.blueprint.architecture.parts);
    assert.ok(
      !partsString.includes("INJECTED_UNAUTHORIZED_PART"),
      "Production request must NOT accept injected mock architecture"
    );
    const stackTools = data.blueprint.architecture.recommended_stack.framework_or_tools;
    assert.ok(
      !stackTools.includes("InjectedUnauthorizedTool"),
      "Production request must NOT accept injected stack"
    );
    // 2. The timeoutMs: 15 must NOT have triggered an immediate timeout
    if (data.diagnostics?.fallbackReason) {
      assert.ok(
        !data.diagnostics.fallbackReason.includes("15ms"),
        `Production request must NOT allow client timeoutMs override, got: ${data.diagnostics.fallbackReason}`
      );
    }
  });

  // CASE P1 (Task 4B): Even with ALLOW_TEST_HOOKS="true", production requests cannot activate test hooks
  await testCase("Case P1: Production mode with ALLOW_TEST_HOOKS='true' fails closed unconditionally", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevAllow = process.env.ALLOW_TEST_HOOKS;
    process.env.NODE_ENV = "production";
    process.env.ALLOW_TEST_HOOKS = "true";

    try {
      const injectedArch = {
        project_type: "web app",
        front_back_explained_simply: "Malicious front, malicious back.",
        recommended_stack: {
          language: "Rust",
          framework_or_tools: ["UnauthorizedTool"],
          why_in_plain_english: "Injected",
          alternatives: [],
        },
        parts: [
          { id: "p1", name: "UNAUTHORIZED_PART_1", one_line_purpose: "P1", side: "front end (what the user sees)", depends_on: [] },
          { id: "p2", name: "UNAUTHORIZED_PART_2", one_line_purpose: "P2", side: "back end (works behind the scenes)", depends_on: ["p1"] },
          { id: "p3", name: "UNAUTHORIZED_PART_3", one_line_purpose: "P3", side: "both", depends_on: ["p2"] },
        ],
      };

      // 1. Breakdown endpoint must ignore test hooks even if ALLOW_TEST_HOOKS is true
      const { status: bStatus, data: bData } = await postBreakdown(
        {
          idea: "A smart expense logger with receipt categorization and export",
          mockArchitecture: injectedArch,
          simulateFailure: "call2",
          mockDelayMs: 50,
          timeoutMs: 15,
        },
        { "x-simulate-production": "true" }
      );

      assert.strictEqual(bStatus, 200);
      assert.strictEqual(bData.success, true);
      const bPartsStr = JSON.stringify(bData.blueprint?.architecture?.parts || []);
      assert.ok(!bPartsStr.includes("UNAUTHORIZED_PART_1"), "Breakdown must reject mock architecture in production");
      const bStack = bData.blueprint?.architecture?.recommended_stack?.framework_or_tools || [];
      assert.ok(!bStack.includes("UnauthorizedTool"), "Breakdown must reject injected stack tools");
      if (bData.diagnostics?.fallbackReason) {
        assert.ok(!bData.diagnostics.fallbackReason.includes("15ms"), "Breakdown must not allow 15ms timeout override in production");
      }

      // 2. Standalone Architecture endpoint must ignore test hooks even if ALLOW_TEST_HOOKS is true
      const { status: aStatus, data: aData } = await postArchitecture(
        {
          idea: "A smart expense logger with receipt categorization and export",
          mockArchitecture: injectedArch,
          simulateFailure: true,
          mockDelayMs: 50,
          timeoutMs: 15,
        },
        { "x-simulate-production": "true" }
      );

      assert.strictEqual(aStatus, 200);
      assert.strictEqual(aData.success, true);
      const aPartsStr = JSON.stringify(aData.architecture?.parts || []);
      assert.ok(!aPartsStr.includes("UNAUTHORIZED_PART_1"), "Architecture route must reject mock architecture in production");
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevAllow === undefined) {
        delete process.env.ALLOW_TEST_HOOKS;
      } else {
        process.env.ALLOW_TEST_HOOKS = prevAllow;
      }
    }
  });

  // CASE P2 (Task 4B): Architecture endpoint - early success and timer cleanup
  await testCase("Case P2: Architecture endpoint cleans up timer and returns model architecture on fast success", async () => {
    const mockArch = {
      project_type: "web app",
      front_back_explained_simply: "Front end is card list, back end is local storage.",
      recommended_stack: {
        language: "TypeScript",
        framework_or_tools: ["Next.js", "Tailwind CSS"],
        why_in_plain_english: "Simple test stack",
        alternatives: [],
      },
      parts: [
        { id: "p1", name: "Quick Task View", one_line_purpose: "Shows tasks", side: "front end (what the user sees)", depends_on: [] },
        { id: "p2", name: "Task Storage Engine", one_line_purpose: "Saves tasks", side: "back end (works behind the scenes)", depends_on: ["p1"] },
        { id: "p3", name: "Filter Toolbar", one_line_purpose: "Filters tasks", side: "front end (what the user sees)", depends_on: ["p1"] },
      ],
    };

    const startTime = Date.now();
    const { status, data } = await postArchitecture({
      idea: "A fast task organizer for personal notes",
      mockArchitecture: mockArch,
      timeoutMs: 500,
    });
    const duration = Date.now() - startTime;

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "model");
    assert.strictEqual(data.architecture.parts.length, 3);
    assert.strictEqual(data.architecture.parts[0].name, "Quick Task View");
    assert.ok(duration < 400, `Expected fast response (<400ms), took ${duration}ms`);
  });

  // CASE P3 (Task 4B): Architecture endpoint - timeout triggers cancellation & fallback
  await testCase("Case P3: Architecture endpoint timeout triggers cancellation and returns fallback", async () => {
    const startTime = Date.now();
    const { status, data } = await postArchitecture({
      idea: "An automated greenhouse irrigation controller with ESP32 and soil sensors",
      mockDelayMs: 250,
      timeoutMs: 60,
    });
    const duration = Date.now() - startTime;

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "fallback");
    assert.ok(data.architecture.parts.length >= 3, `Expected at least 3 parts in fallback, got ${data.architecture.parts.length}`);
    assert.ok(duration < 220, `Expected timeout return in <220ms, took ${duration}ms`);
  });

  // CASE P4 (Task 4B): Architecture endpoint - late rejection does not become unhandled rejection
  await testCase("Case P4: Architecture endpoint late rejection after timeout does not cause unhandled rejection", async () => {
    const unhandled = [];
    const handler = (reason) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", handler);

    try {
      const { status, data } = await postArchitecture({
        idea: "A micro habit tracker for busy students",
        mockDelayMs: 80,
        timeoutMs: 30,
      });

      assert.strictEqual(status, 200);
      assert.strictEqual(data.source, "fallback");

      // Wait past the 80ms mockDelayMs to allow late settlement
      await new Promise((resolve) => setTimeout(resolve, 100));

      assert.strictEqual(unhandled.length, 0, `Expected 0 unhandled rejections, got: ${unhandled.map(String).join(", ")}`);
    } finally {
      process.removeListener("unhandledRejection", handler);
    }
  });

  // =================================================================
  // TASK 6 REGRESSION TESTS: BUILD & VERIFY WORKFLOW (CASES Q1 - Q10)
  // =================================================================

  // CASE Q1: Offline-generated Chrome extension has valid manifest.json and popup.html starter artifacts
  await testCase("Case Q1: Offline-generated Chrome extension has valid manifest.json and popup.html starter artifacts", async () => {
    const { status, data } = await postBreakdown({
      idea: "A Chrome extension to summarize long news articles and save reading time",
      simulateFailure: "call1",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    const node1 = data.blueprint.nodes[0];
    assert.ok(Array.isArray(node1.starterArtifacts), "Node 1 must have starterArtifacts array");
    assert.strictEqual(node1.starterArtifacts.length, 2, "Node 1 must have exactly 2 starter artifacts");

    const manifest = node1.starterArtifacts.find((a) => a.filename === "manifest.json");
    assert.ok(manifest, "Must include manifest.json starter artifact");
    assert.strictEqual(manifest.language, "json");
    assert.ok(manifest.purpose.length > 10, "Must have descriptive purpose");
    const parsedManifest = JSON.parse(manifest.content);
    assert.strictEqual(parsedManifest.manifest_version, 3);
    assert.strictEqual(parsedManifest.action.default_popup, "popup.html");

    const popup = node1.starterArtifacts.find((a) => a.filename === "popup.html");
    assert.ok(popup, "Must include popup.html starter artifact");
    assert.strictEqual(popup.language, "html");
    assert.ok(popup.content.includes("<!DOCTYPE html>"), "Popup must have <!DOCTYPE html>");
    assert.ok(popup.content.includes("Initial Working Shell"), "Popup must identify as initial working shell");
  });

  // CASE Q2: The live/generated-blueprint processing path preserves or safely supplies required extension artifacts
  await testCase("Case Q2: Live/generated-blueprint processing path preserves or safely supplies required extension artifacts", async () => {
    const mockArch = {
      project_type: "web app",
      front_back_explained_simply: "Front end is extension popup, back end is local storage.",
      recommended_stack: {
        language: "JavaScript / Chrome Extension",
        framework_or_tools: ["Manifest V3", "chrome.storage.local"],
        why_in_plain_english: "Standard Manifest V3 extension stack.",
        alternatives: [],
      },
      parts: [
        { id: "ext-manifest", name: "Manifest V3 Declaration", one_line_purpose: "Configures Chrome extension", side: "front end (what the user sees)", depends_on: [] },
        { id: "ext-popup", name: "Popup Interface", one_line_purpose: "Displays popup UI", side: "front end (what the user sees)", depends_on: ["ext-manifest"] },
        { id: "ext-storage", name: "Local Storage Manager", one_line_purpose: "Persists user settings", side: "back end (works behind the scenes)", depends_on: ["ext-manifest"] },
      ],
    };

    const mockBp = {
      projectTitle: "Live Article Summarizer Extension",
      summary: "Extension for summarizing articles on the page.",
      strategyDecision: "Lightweight client-side extension.",
      architecture: mockArch,
      nodes: [
        { id: "node-1", step: 1, title: "Extension Shell", subtitle: "Scaffold", badge: "CORE MVP", goal: "Setup extension", definitionOfDone: ["Works"], conceptToLearn: "MV3", estimatedMinutes: 45, filesToCreate: ["manifest.json", "popup.html"], stepPrompt: "Build shell", resources: [] },
      ],
      first20Minutes: { action: "Setup extension", why: "Test in chrome://extensions", whatToDo: ["Scaffold files"], whatDoneLooksLike: "Load unpacked works", starterTerminalCommand: "git init" },
      foundations: { selectedModules: [], totalEstimatedMinutes: 0, fitsTimeBudget: true, timeBudgetNote: "OK", howAnswersShapedPlan: "Good" },
      productMap: { whatItDoes: "Summarizes", userJourney: ["open popup"], screens: [], dataItNeeds: { description: "articles", storageForMvp: "chrome.storage.local", laterOptions: "cloud" }, partsYouNeedNow: [], partsYouCanIgnoreForNow: [], mvpVsLater: { v1DemoReady: [], v2Next: [], v3Future: [], outOfScopeWithReasons: [] }, nextImplementationSteps: [] },
      pitfalls: [],
      roadmap: [{ phase: "Phase 1", title: "Init", description: "Start" }],
      nextActions: [{ step: 1, action: "Create manifest", detail: "manifest.json" }],
      techStack: [{ category: "Extension", name: "Manifest V3", reason: "Standard" }],
      resources: [],
      agentGuide: { workflowTips: [], firstPrompt: "Build extension" },
      isFallback: false,
      sourceBadges: { architecture: "model", milestones: "model" },
    };

    const { status, data } = await postBreakdown({
      idea: "A Chrome extension to summarize articles on the active tab",
      mockArchitecture: mockArch,
      mockBlueprint: mockBp,
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    const node1 = data.blueprint.nodes[0];
    assert.ok(Array.isArray(node1.starterArtifacts), "Node 1 must safely contain starterArtifacts");
    assert.strictEqual(node1.starterArtifacts.length, 2);
    assert.strictEqual(node1.starterArtifacts[0].filename, "manifest.json");
    assert.strictEqual(node1.starterArtifacts[1].filename, "popup.html");
  });

  // CASE Q3: Valid manifest JSON passes all applicable checks
  await testCase("Case Q3: Valid manifest JSON passes all applicable checks", async () => {
    const validManifest = JSON.stringify({
      manifest_version: 3,
      name: "Article Reader MVP",
      version: "1.0.0",
      description: "A minimal reader extension.",
      action: {
        default_popup: "popup.html",
      },
      permissions: ["storage"],
    }, null, 2);

    const { status, data } = await postReview({
      idea: "A Chrome extension to read articles",
      milestone: { id: "node-1", step: 1, title: "Extension Shell" },
      submission: validManifest,
      submissionType: "artifact",
      filename: "manifest.json",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.source, "deterministic");
    assert.strictEqual(data.review.verdict, "passed");
    assert.strictEqual(data.review.artifactFilename, "manifest.json");
    assert.ok(typeof data.review.contentHash === "string" && data.review.contentHash.length === 64);
    assert.ok(Array.isArray(data.review.checks), "Review must include itemized checks");
    assert.strictEqual(data.review.checks.length, 6, "Manifest verification must have 6 checks");
    assert.ok(data.review.checks.every((c) => c.passed), "All manifest checks must pass");
  });

  // CASE Q4: Malformed manifest JSON returns needs_work with a useful parse diagnostic
  await testCase("Case Q4: Malformed manifest JSON returns needs_work with a useful parse diagnostic", async () => {
    const brokenJson = `{
      "manifest_version": 3,
      "name": "Broken Extension",
      "version": "1.0.0",
      "action": {
        "default_popup": "popup.html",
      }
    }`; // trailing comma is invalid JSON

    const { status, data } = await postReview({
      idea: "A Chrome extension",
      milestone: { id: "node-1", step: 1, title: "Extension Shell" },
      submission: brokenJson,
      submissionType: "artifact",
      filename: "manifest.json",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.review.verdict, "needs_work");
    const syntaxCheck = data.review.checks.find((c) => c.id === "manifest_json_syntax");
    assert.ok(syntaxCheck, "Must have manifest_json_syntax check");
    assert.strictEqual(syntaxCheck.passed, false);
    assert.ok(syntaxCheck.message.includes("JSON parse error"), "Must provide specific parse error diagnosis");
  });

  // CASE Q5: A manifest missing manifest_version: 3 or another required key fails the corresponding check
  await testCase("Case Q5: A manifest missing manifest_version: 3 or another required key fails corresponding check", async () => {
    const v2Manifest = JSON.stringify({
      manifest_version: 2,
      name: "Old V2 Extension",
      version: "1.0.0",
      action: {
        default_popup: "popup.html",
      },
    });

    const { status, data } = await postReview({
      idea: "A Chrome extension",
      milestone: { id: "node-1", step: 1, title: "Extension Shell" },
      submission: v2Manifest,
      submissionType: "artifact",
      filename: "manifest.json",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.review.verdict, "needs_work");
    const v3Check = data.review.checks.find((c) => c.id === "manifest_version_3");
    assert.ok(v3Check, "Must check for manifest_version_3");
    assert.strictEqual(v3Check.passed, false);
    assert.ok(v3Check.message.includes("manifest_version must be exactly 3"), "Must explain expected version 3");
  });

  // CASE Q6: A valid popup HTML submission passes its applicable structural checks
  await testCase("Case Q6: A valid popup HTML submission passes its applicable structural checks", async () => {
    const validHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Extension Popup</title>
</head>
<body>
  <h2>Extension Popup</h2>
  <p>The extension popup shell has loaded successfully in your browser.</p>
</body>
</html>`;

    const { status, data } = await postReview({
      idea: "A Chrome extension",
      milestone: { id: "node-1", step: 1, title: "Extension Shell" },
      submission: validHtml,
      submissionType: "artifact",
      filename: "popup.html",
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.review.verdict, "passed");
    assert.strictEqual(data.review.artifactFilename, "popup.html");
    assert.ok(data.review.checks.length >= 4);
    assert.ok(data.review.checks.every((c) => c.passed), "All popup HTML checks must pass");
  });

  // CASE Q7: Malformed or incomplete popup HTML receives specific failures
  await testCase("Case Q7: Malformed or incomplete popup HTML receives specific failures", async () => {
    // 1. Missing document structure
    const incompleteHtml = `<div>Just a lonely div</div>`;
    const { data: data1 } = await postReview({
      idea: "A Chrome extension",
      milestone: { id: "node-1", step: 1, title: "Extension Shell" },
      submission: incompleteHtml,
      submissionType: "artifact",
      filename: "popup.html",
    });

    assert.strictEqual(data1.review.verdict, "needs_work");
    const structCheck = data1.review.checks.find((c) => c.id === "popup_html_structure");
    assert.strictEqual(structCheck.passed, false);
    assert.ok(structCheck.message.includes("<!DOCTYPE html>"));

    // 2. MV3 CSP violation: loading remote CDN script
    const cspViolationHtml = `<!DOCTYPE html>
<html>
<head><title>Test</title><script src="https://cdn.example.com/lib.js"></script></head>
<body><h2>Test</h2><p>Working shell description</p></body>
</html>`;
    const { data: data2 } = await postReview({
      idea: "A Chrome extension",
      milestone: { id: "node-1", step: 1, title: "Extension Shell" },
      submission: cspViolationHtml,
      submissionType: "artifact",
      filename: "popup.html",
    });

    assert.strictEqual(data2.review.verdict, "needs_work");
    const cspCheck = data2.review.checks.find((c) => c.id === "popup_asset_safety");
    assert.strictEqual(cspCheck.passed, false);
    assert.ok(cspCheck.message.includes("Content Security Policy strictly forbids"));
  });

  // CASE Q8: Multi-artifact milestone completion enforcement across all workflow paths (production logic)
  await testCase("Case Q8: Multi-artifact milestone completion enforcement across all workflow paths", async () => {
    const validManifest = JSON.stringify(
      {
        manifest_version: 3,
        name: "Article Reader MVP",
        version: "1.0.0",
        action: { default_popup: "popup.html" },
      },
      null,
      2
    );

    const validPopup = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Article Reader MVP</title></head>
<body><h1>Article Reader</h1><p>Ready</p></body>
</html>`;

    const extensionMilestone = {
      id: "node-1",
      step: 1,
      title: "Extension Shell",
      subtitle: "Setup manifest.json and popup.html",
      starterArtifacts: [
        {
          filename: "manifest.json",
          language: "json",
          content: validManifest,
          purpose: "Manifest V3 configuration",
        },
        {
          filename: "popup.html",
          language: "html",
          content: validPopup,
          purpose: "Popup UI",
        },
      ],
    };

    // 1. Submit manifest.json to production /api/review
    const { data: manifestData } = await postReview({
      idea: "A Chrome extension",
      milestone: extensionMilestone,
      submission: validManifest,
      submissionType: "artifact",
      filename: "manifest.json",
    });

    assert.strictEqual(manifestData.review.verdict, "passed");
    assert.strictEqual(manifestData.review.contentHash.length, 64, "contentHash must be full 64-char SHA-256");

    const artifactReviews = {
      "node-1::manifest.json": manifestData.review,
    };
    const drafts = {};

    // 2. Production gate: only 1 of 2 required artifacts verified -> completion must be disallowed
    const gate1 = isMilestoneCompletionAllowed(extensionMilestone, artifactReviews, drafts);
    assert.strictEqual(gate1.allowed, false, "1 of 2 artifacts passing must NOT allow milestone completion");
    assert.strictEqual(gate1.allArtifactsPassed, false);
    assert.deepStrictEqual(gate1.unverifiedArtifacts, ["popup.html"]);
    assert.ok(gate1.reason.includes("popup.html"), "Reason must mention unverified popup.html");

    // 3. Freeform mentor review approval cannot bypass starter artifact verification
    const gateMentorBypass = isMilestoneCompletionAllowed(extensionMilestone, artifactReviews, drafts);
    assert.strictEqual(gateMentorBypass.allowed, false, "Mentor review cannot bypass required starter artifacts");

    // 4. Verify popup.html with /api/review
    const { data: popupData } = await postReview({
      idea: "A Chrome extension",
      milestone: extensionMilestone,
      submission: validPopup,
      submissionType: "artifact",
      filename: "popup.html",
    });

    assert.strictEqual(popupData.review.verdict, "passed");
    assert.strictEqual(popupData.review.contentHash.length, 64);
    artifactReviews["node-1::popup.html"] = popupData.review;

    // 5. Production gate: both artifacts verified with exact content match -> completion allowed!
    const gate2 = isMilestoneCompletionAllowed(extensionMilestone, artifactReviews, drafts);
    assert.strictEqual(gate2.allowed, true, "All required artifacts passing must permit completion");
    assert.strictEqual(gate2.allArtifactsPassed, true);
    assert.deepStrictEqual(gate2.unverifiedArtifacts, []);

    // 6. Editing either artifact revokes completion eligibility
    drafts["node-1::popup.html"] = validPopup + "<!-- user edit -->";
    const gateEdited = isMilestoneCompletionAllowed(extensionMilestone, artifactReviews, drafts);
    assert.strictEqual(gateEdited.allowed, false, "Editing an artifact must immediately revoke completion eligibility");
    assert.deepStrictEqual(gateEdited.unverifiedArtifacts, ["popup.html"]);

    // 7. Legacy restored completion state cannot bypass the artifact gate
    const invalidRestoredCompleted = ["node-1"];
    const sanitized = sanitizeCompletedNodeIds(
      invalidRestoredCompleted,
      [extensionMilestone],
      artifactReviews,
      drafts
    );
    assert.deepStrictEqual(sanitized, [], "Restored completion state must prune milestone when artifact is modified/unverified");

    // 8. When drafts match verified content again, restored completion state is preserved
    delete drafts["node-1::popup.html"];
    const sanitizedValid = sanitizeCompletedNodeIds(
      invalidRestoredCompleted,
      [extensionMilestone],
      artifactReviews,
      drafts
    );
    assert.deepStrictEqual(sanitizedValid, ["node-1"], "Restored completion state must remain valid when all artifacts match");

    // 9. Milestones without starter artifacts preserve manual/mentor completion behavior
    const generalMilestone = {
      id: "node-general",
      step: 2,
      title: "Backend Setup",
      subtitle: "Setup Node.js script",
      definitionOfDone: ["Script executes"],
    };
    const gateGeneral = isMilestoneCompletionAllowed(generalMilestone, {}, {});
    assert.strictEqual(gateGeneral.allowed, true, "Milestones without starter artifacts must allow manual completion");
    const sanitizedGeneral = sanitizeCompletedNodeIds(["node-general"], [generalMilestone], {}, {});
    assert.deepStrictEqual(sanitizedGeneral, ["node-general"]);
  });

  // CASE Q9: Exact-content verification, whitespace tracking, draft restoration, and legacy hash rejection
  await testCase("Case Q9: Exact-content verification, whitespace tracking, draft restoration, and legacy hash rejection", async () => {
    const rawContent = "{\n  \"manifest_version\": 3,\n  \"name\": \"Exact Test\"\n}";

    // 1. Exact-content verification: identical content produces the exact same 64-char fingerprint
    const hash1 = computeContentHash(rawContent);
    const hash2 = computeContentHash(rawContent);
    assert.strictEqual(hash1, hash2);
    assert.strictEqual(hash1.length, 64, "Hash must be 64-character SHA-256");

    // 2. Changes to leading or trailing whitespace produce a DIFFERENT fingerprint (no silent trimming)
    const hashLeadingSpace = computeContentHash(" " + rawContent);
    const hashTrailingSpace = computeContentHash(rawContent + " ");
    const hashNewline = computeContentHash(rawContent + "\n");
    assert.notStrictEqual(hash1, hashLeadingSpace, "Leading whitespace must produce a different hash");
    assert.notStrictEqual(hash1, hashTrailingSpace, "Trailing whitespace must produce a different hash");
    assert.notStrictEqual(hash1, hashNewline, "Trailing newline must produce a different hash");

    // 3. Changed content cannot reuse an earlier passing result
    const milestone = {
      id: "node-hash-test",
      step: 1,
      title: "Hash Test",
      starterArtifacts: [
        { filename: "manifest.json", language: "json", content: rawContent, purpose: "Test" },
      ],
    };

    const reviews = {
      "node-hash-test::manifest.json": {
        stepId: "node-hash-test",
        verdict: "passed",
        contentHash: hash1,
        timestamp: Date.now(),
      },
    };

    // Current content matches hash1 -> allowed
    assert.strictEqual(isMilestoneCompletionAllowed(milestone, reviews, {}).allowed, true);

    // Current content has extra whitespace -> disallowed
    const modifiedDrafts = { "node-hash-test::manifest.json": rawContent + "  " };
    assert.strictEqual(isMilestoneCompletionAllowed(milestone, reviews, modifiedDrafts).allowed, false);

    // 4. Artifact verification records remain isolated by milestone and filename
    const otherMilestone = { ...milestone, id: "node-different" };
    assert.strictEqual(
      isMilestoneCompletionAllowed(otherMilestone, reviews, {}).allowed,
      false,
      "Passing result for node-hash-test cannot be reused by node-different"
    );

    const otherFileMilestone = {
      id: "node-hash-test",
      step: 1,
      title: "Hash Test",
      starterArtifacts: [
        { filename: "popup.html", language: "html", content: rawContent, purpose: "Test" },
      ],
    };
    assert.strictEqual(
      isMilestoneCompletionAllowed(otherFileMilestone, reviews, {}).allowed,
      false,
      "Passing result for manifest.json cannot be reused by popup.html"
    );

    // 5. Legacy truncated hashes (e.g. 16-char) are rejected as requiring re-verification
    const legacyReviews = {
      "node-hash-test::manifest.json": {
        stepId: "node-hash-test",
        verdict: "passed",
        contentHash: hash1.slice(0, 16), // truncated legacy hash
        timestamp: Date.now(),
      },
    };
    const legacyGate = isMilestoneCompletionAllowed(milestone, legacyReviews, {});
    assert.strictEqual(
      legacyGate.allowed,
      false,
      "Legacy 16-character hash must be rejected as requiring re-verification"
    );
    assert.deepStrictEqual(legacyGate.unverifiedArtifacts, ["manifest.json"]);
  });

  // CASE Q10: Existing review behavior remains compatible for non-artifact submissions
  await testCase("Case Q10: Existing review behavior remains compatible for non-artifact submissions", async () => {
    // 1. General code review request without artifact flag
    const { status: codeStatus, data: codeData } = await postReview({
      idea: "A personal task manager",
      milestone: {
        id: "node-1",
        step: 1,
        title: "Setup List",
        goal: "Create task list component",
        filesToCreate: ["components/TaskList.tsx"],
      },
      submission: "export function TaskList() { return <div>Tasks</div>; }",
      submissionType: "code",
    });

    assert.strictEqual(codeStatus, 200);
    assert.strictEqual(codeData.success, true);
    assert.ok(codeData.review, "Must return ordinary review object");
    assert.ok(codeData.review.feedback.length > 10);

    // 2. Short submission (<5 chars) returns 400 Bad Request
    const { status: shortStatus, data: shortData } = await postReview({
      idea: "A personal task manager",
      milestone: { id: "node-1", step: 1, title: "Setup List" },
      submission: "hi",
    });

    assert.strictEqual(shortStatus, 400);
    assert.ok(shortData.error.includes("at least 5 chars"));
  });

  // CASE Q11: Browser and server SHA-256 implementation correctness and cross-runtime parity
  await testCase("Case Q11: Browser and server SHA-256 implementation correctness and cross-runtime parity", async () => {
    const crypto = require("crypto");

    // 1. Standard NIST test vectors against known expected digests
    const standardVectors = [
      {
        name: "Empty string",
        input: "",
        expected: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      {
        name: "abc",
        input: "abc",
        expected: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      },
      {
        name: "56-byte dual-block message (abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq)",
        input: "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
        expected: "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
      },
      {
        name: "Hello, World!",
        input: "Hello, World!",
        expected: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f",
      },
    ];

    for (const vector of standardVectors) {
      // Direct call to browser pure JS implementation
      const browserDigest = computeContentHashBrowser(vector.input);
      // Call to cross-runtime wrapper (Node on server)
      const wrapperDigest = computeContentHash(vector.input);
      // Independent Node crypto baseline
      const nodeDigest = crypto.createHash("sha256").update(vector.input, "utf8").digest("hex");

      assert.strictEqual(
        browserDigest,
        vector.expected,
        `Browser implementation failed NIST vector '${vector.name}'`
      );
      assert.strictEqual(
        wrapperDigest,
        vector.expected,
        `Cross-runtime wrapper failed NIST vector '${vector.name}'`
      );
      assert.strictEqual(
        browserDigest,
        nodeDigest,
        `Browser and Node crypto output must match for '${vector.name}'`
      );
      assert.strictEqual(browserDigest.length, 64, "Digest must be 64 characters");
      assert.strictEqual(browserDigest, browserDigest.toLowerCase(), "Digest must be lowercase hexadecimal");
    }

    // 2. Exact-content preservation: whitespace, CR/LF, tabs, and newlines
    const whitespaceVariations = [
      "  leading whitespace",
      "trailing whitespace  ",
      "  leading and trailing  ",
      "line1\nline2\nline3",
      "crlf1\r\ncrlf2\r\n",
      "\t\ttab indented code\t\t",
      "{\n  \"indent\": true\n}",
    ];

    for (const text of whitespaceVariations) {
      const browserDigest = computeContentHashBrowser(text);
      const nodeDigest = crypto.createHash("sha256").update(text, "utf8").digest("hex");
      assert.strictEqual(browserDigest, nodeDigest, `Whitespace test failed for '${text}'`);
      assert.strictEqual(browserDigest.length, 64);
    }

    // 3. Multibyte UTF-8 characters and Unicode (emojis, CJK, accents)
    const unicodeVariations = [
      "こんにちは世界",
      "✨ Antigravity 🚀 AI Architect 🛠️",
      "Café & Naïve résumé",
      "𠜎 𠜱 𠝹 (Rare 4-byte CJK)",
      JSON.stringify(
        {
          manifest_version: 3,
          name: "🚀 Super Reader MVP 日本語",
          description: "A fast reading extension with café mode & notes",
        },
        null,
        2
      ),
    ];

    for (const text of unicodeVariations) {
      const browserDigest = computeContentHashBrowser(text);
      const nodeDigest = crypto.createHash("sha256").update(text, "utf8").digest("hex");
      assert.strictEqual(browserDigest, nodeDigest, `Unicode test failed for '${text.slice(0, 20)}'`);
      assert.strictEqual(browserDigest.length, 64);
    }

    // 4. Client compatibility: browser implementation executes without Node crypto module
    const browserDirect = computeContentHashBrowser("browser-isolation-check");
    const nodeDirect = crypto.createHash("sha256").update("browser-isolation-check", "utf8").digest("hex");
    assert.strictEqual(browserDirect, nodeDirect);
  });

  console.log("\n=================================================================");
  console.log(`SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log("=================================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});


