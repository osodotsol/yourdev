import { FoundationModule, LearnerProfileAnswers } from "@/types/blueprint";

export const FOUNDATIONS_BANK: Record<string, FoundationModule> = {
  web_basics: {
    id: "web_basics",
    title: "1. How Apps and the Web Work",
    plainEnglishSummary:
      "Your computer's browser is like a restaurant customer ordering food, and the server is the kitchen preparing and sending the webpage back.",
    minutes: 15,
    tier: "core",
    prerequisites: [],
    officialResource: {
      title: "MDN: How the Web Works (Official Docs)",
      url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works",
    },
    youreDoneWhen: [
      "You can open Developer Tools in Chrome (F12) and see the Network tab logging requests when you refresh a page.",
    ],
    vibeMinimumNote:
      "Just know that client code runs on the user's laptop and server code runs on a computer in the cloud.",
    deeperNote:
      "Understand HTTP status codes (200 OK, 404 Not Found, 500 Server Error) so you know what terminal logs mean.",
  },

  editor_terminal: {
    id: "editor_terminal",
    title: "2. Code Editor & Terminal Basics",
    plainEnglishSummary:
      "A code editor like VS Code is your digital workbench, while the terminal is a command text channel to run scripts directly.",
    minutes: 20,
    tier: "core",
    prerequisites: [],
    officialResource: {
      title: "VS Code Getting Started (Official Docs)",
      url: "https://code.visualstudio.com/docs/introvideos/basics",
    },
    youreDoneWhen: [
      "You have VS Code open and can run `pwd` (or `cd`) in the integrated terminal without error.",
    ],
    vibeMinimumNote:
      "You only need to know how to open a project folder, paste files, and run `npm run dev` in the terminal.",
    deeperNote:
      "Learn essential shell commands: `cd`, `ls` / `dir`, `mkdir`, and `Ctrl+C` to cancel a hanging command.",
  },

  git_basics: {
    id: "git_basics",
    title: "3. Git Basics (Save, Undo, Share)",
    plainEnglishSummary:
      "Git is like a video game save system: every commit creates an indestructible restore checkpoint you can jump back to if code breaks.",
    minutes: 25,
    tier: "core",
    prerequisites: ["editor_terminal"],
    officialResource: {
      title: "GitHub Git Handbook (Official Docs)",
      url: "https://docs.github.com/en/get-started/using-git/about-git",
    },
    youreDoneWhen: [
      "You can run `git status` in your project folder and see a clean working tree.",
      "You can make one change, run `git commit -m 'test'`, and see it in `git log`.",
    ],
    vibeMinimumNote:
      "Always commit before asking an AI agent to edit files. If the agent makes a mess, `git restore .` undoes everything in 1 second.",
    deeperNote:
      "Learn staging with `git add`, writing clear 1-line commit messages, and pushing to a remote GitHub repository.",
  },

  html_css: {
    id: "html_css",
    title: "4. HTML + CSS Foundations",
    plainEnglishSummary:
      "HTML is the brickwork and skeleton of a house; CSS is the paint, lighting, and interior decoration that makes it look polished.",
    minutes: 25,
    tier: "core",
    prerequisites: ["web_basics"],
    officialResource: {
      title: "MDN HTML & CSS Basics (Official Docs)",
      url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics",
    },
    youreDoneWhen: [
      "You can identify an `<h1>`, a `<button>`, and an `<input>` tag in code.",
      "You understand how CSS classes (like Tailwind utility classes) change colors and padding.",
    ],
    vibeMinimumNote:
      "You don't need to write CSS from scratch. Just recognize tags so you can spot if an AI agent forgot an input box or button.",
    deeperNote:
      "Understand the CSS box model (margin, padding, border) and Flexbox (`display: flex`) for placing items side by side.",
  },

  js_basics: {
    id: "js_basics",
    title: "5. JavaScript / TypeScript Core",
    plainEnglishSummary:
      "JavaScript is the electrical wiring of your app: it listens for clicks, stores user inputs in memory, and triggers updates.",
    minutes: 30,
    tier: "core",
    prerequisites: ["html_css"],
    officialResource: {
      title: "JavaScript Guide (Official Docs)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    },
    youreDoneWhen: [
      "You understand what a variable (`const x = 5`) and a function (`function onClick() {}`) are.",
      "You can read a `console.log()` output in your browser developer tools.",
    ],
    vibeMinimumNote:
      "Know that objects `{ key: value }` and arrays `[1, 2, 3]` hold data. When an agent creates a bug, it's usually trying to read a missing key.",
    deeperNote:
      "Practice arrow functions, array methods (`.map()`, `.filter()`), and asynchronous `async/await` syntax for fetching data.",
  },

  ai_agent_safety: {
    id: "ai_agent_safety",
    title: "6. Working with AI Coding Agents Safely",
    plainEnglishSummary:
      "An AI agent is like a hyperactive junior developer who types 500 words per minute but will confidently break your working app if you give vague instructions.",
    minutes: 20,
    tier: "core",
    prerequisites: ["git_basics"],
    officialResource: {
      title: "AI Coding Agents: Effective Pair Programming Guide",
      url: "https://docs.github.com/en/copilot",
    },
    youreDoneWhen: [
      "You write prompts that ask for only ONE file or slice at a time.",
      "You verify the code in your browser before prompting for the next feature.",
    ],
    vibeMinimumNote:
      "Rule #1 of vibe coding: Never prompt an agent twice in a row without testing the first change. Always keep your browser open next to your editor.",
    deeperNote:
      "Learn to feed compiler and terminal errors verbatim into the agent prompt with the exact line number.",
  },

  apis_json: {
    id: "apis_json",
    title: "7. APIs and JSON Data",
    plainEnglishSummary:
      "An API is like a restaurant drive-thru menu; JSON is the standardized cardboard takeout box the data arrives in so any program can read it.",
    minutes: 25,
    tier: "deeper",
    prerequisites: ["js_basics"],
    officialResource: {
      title: "MDN Working with JSON (Official Docs)",
      url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON",
    },
    youreDoneWhen: [
      "You can recognize valid JSON format: `{ \"title\": \"My Habit\", \"count\": 3 }`.",
      "You know that `fetch('/api/...')` is how frontend code requests data from a backend.",
    ],
    vibeMinimumNote:
      "If your MVP uses local browser storage, you can ignore custom backend APIs for now. Only learn JSON format.",
    deeperNote:
      "Understand HTTP GET vs POST methods, headers (`Content-Type: application/json`), and parsing with `response.json()`.",
  },

  framework_react: {
    id: "framework_react",
    title: "8. Framework Basics (React / Next.js)",
    plainEnglishSummary:
      "A framework is like a box of pre-fabricated Lego components so you don't have to carve every single plastic button and page by hand.",
    minutes: 30,
    tier: "deeper",
    prerequisites: ["html_css", "js_basics"],
    officialResource: {
      title: "React Official Quick Start (Official Docs)",
      url: "https://react.dev/learn",
    },
    youreDoneWhen: [
      "You know that a React component is just a function that returns HTML-like code (JSX).",
      "You know what `useState` is: a memory slot that re-renders the screen whenever its value changes.",
    ],
    vibeMinimumNote:
      "Know that UI is built out of reusable components (`<Header />`, `<Card />`). Let the AI agent write the component boilerplate.",
    deeperNote:
      "Master props (passing data down) and component state loops to avoid unnecessary re-rendering.",
  },

  storing_data: {
    id: "storing_data",
    title: "9. Storing Data (Browser Storage First)",
    plainEnglishSummary:
      "Browser LocalStorage is like a sticky note on your user's laptop; a cloud database is a filing cabinet in someone else's server farm that requires passwords and bills.",
    minutes: 20,
    tier: "later",
    prerequisites: ["js_basics"],
    officialResource: {
      title: "MDN Web Storage API (Official Docs)",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
    },
    youreDoneWhen: [
      "You can run `localStorage.setItem('test', '123')` in the browser console, refresh, and get it back with `localStorage.getItem('test')`.",
    ],
    vibeMinimumNote:
      "For your Phase 1 MVP, 100% of your persistence should be LocalStorage or a local file. Zero databases, zero auth, zero sign-up friction.",
    deeperNote:
      "Learn JSON serialization (`JSON.stringify` and `JSON.parse`) and handling storage size limits safely with try/catch.",
  },

  deploying_first_app: {
    id: "deploying_first_app",
    title: "10. Deploying Your First App",
    plainEnglishSummary:
      "Deploying is like rolling your prototype out of your private garage onto a public sidewalk so anyone with a web link can try it.",
    minutes: 20,
    tier: "later",
    prerequisites: ["git_basics"],
    officialResource: {
      title: "Vercel Deployment Guide (Official Docs)",
      url: "https://vercel.com/docs/deployments/overview",
    },
    youreDoneWhen: [
      "You have a public live URL (e.g. `your-app.vercel.app`) that loads your app on your mobile phone.",
    ],
    vibeMinimumNote:
      "Deploy only AFTER the local prototype is working. A 1-click Vercel or GitHub Pages deploy is all you need for an initial public release.",
    deeperNote:
      "Learn how environment variables are set in production dashboards versus your local `.env.local` file.",
  },
};

/**
 * Returns ordered foundation modules tailored to the learner's profile and project idea.
 */
export function buildTailoredFoundations(
  ideaText: string,
  profile: LearnerProfileAnswers
): {
  selectedModules: FoundationModule[];
  totalEstimatedMinutes: number;
  fitsTimeBudget: boolean;
  timeBudgetNote: string;
  howAnswersShapedPlan: string;
} {
  const isVibe = profile.codingStyle === "vibe";
  const isBeginner = profile.experienceLevel === "none";
  const lowerIdea = ideaText.toLowerCase();

  const isCli = lowerIdea.includes("cli") || lowerIdea.includes("terminal");
  const isWeb = !isCli;

  // Ordered dependency list of candidate modules
  const candidateIds: string[] = [
    "web_basics",
    "editor_terminal",
    "git_basics",
    "html_css",
    "js_basics",
    "ai_agent_safety",
    "apis_json",
    "framework_react",
    "storing_data",
    "deploying_first_app",
  ];

  // Filter based on project type
  const activeIds = candidateIds.filter((id) => {
    if (isCli && (id === "html_css" || id === "framework_react")) {
      return false; // CLI doesn't need HTML/React
    }
    return true;
  });

  const selectedModules: FoundationModule[] = activeIds.map((id) => {
    const raw = FOUNDATIONS_BANK[id];
    let adjustedMinutes = raw.minutes;

    // Beginner adjustment: smaller, bite-sized minutes
    if (isBeginner) {
      adjustedMinutes = Math.round(raw.minutes * 0.8);
    }

    // Determine tier based on coding style
    let tier = raw.tier;
    if (isVibe) {
      // For vibe coders: 1, 2, 3, 6 are core. 4, 5, 7, 8 are deeper. 9, 10 are later.
      if (id === "web_basics" || id === "editor_terminal" || id === "git_basics" || id === "ai_agent_safety") {
        tier = "core";
      } else if (id === "html_css" || id === "js_basics" || id === "framework_react" || id === "apis_json") {
        tier = "deeper";
      } else {
        tier = "later";
      }
    }

    // Contextual project reason
    let whyNeeded = "Essential foundation for building software reliably.";
    if (id === "web_basics") {
      whyNeeded = `Understand how your ${isCli ? "command tool" : "app"} communicates with users and external services.`;
    } else if (id === "editor_terminal") {
      whyNeeded = `You will use the terminal to run and verify your local prototype.`;
    } else if (id === "git_basics") {
      whyNeeded = `Protects your project so you can experiment freely without fear of losing working code.`;
    } else if (id === "html_css") {
      whyNeeded = `Structures the user interface for your project.`;
    } else if (id === "js_basics") {
      whyNeeded = `Powers the interactive controls and state updates for your MVP.`;
    } else if (id === "ai_agent_safety") {
      whyNeeded = isVibe
        ? `Critical: You will be directing an AI agent to build your project step by step.`
        : `Helps you partner with your coding agent without letting it hallucinate out-of-scope code.`;
    } else if (id === "framework_react") {
      whyNeeded = `Provides component building blocks to assemble your screens rapidly.`;
    } else if (id === "storing_data") {
      whyNeeded = `Lets your users save their data locally with zero database setup overhead.`;
    } else if (id === "deploying_first_app") {
      whyNeeded = `Generates a live public link so users and stakeholders can test your working prototype.`;
    }

    return {
      ...raw,
      minutes: adjustedMinutes,
      tier,
      whyNeededForProject: whyNeeded,
    };
  });

  // Calculate total minutes for core modules
  const coreModules = selectedModules.filter((m) => m.tier === "core");
  const totalCoreMinutes = coreModules.reduce((acc, m) => acc + m.minutes, 0);
  const totalAllMinutes = selectedModules.reduce((acc, m) => acc + m.minutes, 0);

  // Time budget calculation
  const hoursPerDay = profile.hoursPerDay || 2;
  const days = profile.daysAvailable || 7;
  const totalBudgetMinutes = hoursPerDay * days * 60;
  // Dedicate 30% of total budget to learning fundamentals, 70% to building
  const availableLearningMinutes = Math.round(totalBudgetMinutes * 0.3);

  const fitsTimeBudget = availableLearningMinutes >= totalCoreMinutes;

  let timeBudgetNote = `With ${hoursPerDay}h/day over ${days} days (~${totalBudgetMinutes / 60}h total), you have ~${Math.round(availableLearningMinutes / 60)}h for fundamentals. The core vibe-minimum path takes ~${Math.round(totalCoreMinutes / 60)}h, fitting comfortably inside your schedule.`;

  if (!fitsTimeBudget) {
    timeBudgetNote = `Your time budget is tight (~${Math.round(availableLearningMinutes / 60)}h for learning). We have condensed the core path down to the absolute essentials (${totalCoreMinutes} mins) and deferred frameworks and deployment to "Level Up Later".`;
  }

  // How answers shaped plan
  const styleLabel =
    profile.codingStyle === "vibe"
      ? "AI Agent (Vibe Coding)"
      : profile.codingStyle === "myself"
      ? "Writing code yourself"
      : "A hybrid mix";

  const expLabel =
    profile.experienceLevel === "none"
      ? "first-time learner (bite-sized steps & analogies)"
      : profile.experienceLevel === "beginner"
      ? "beginner with light experience"
      : "intermediate builder";

  const howAnswersShapedPlan = `Calibrated for ${styleLabel} as a ${expLabel}: Core path prioritizes safety, Git checkpoints, and prompt verification so you can direct an AI agent without getting stuck. Heavy databases and authentication are deferred to Level Up Later.`;

  return {
    selectedModules,
    totalEstimatedMinutes: isVibe ? totalCoreMinutes : totalAllMinutes,
    fitsTimeBudget,
    timeBudgetNote,
    howAnswersShapedPlan,
  };
}
