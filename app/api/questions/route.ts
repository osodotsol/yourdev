import { NextRequest, NextResponse } from "next/server";
import { ClarifyingQuestion } from "@/types/blueprint";

const INTAKE_FOUNDATION_QUESTIONS: ClarifyingQuestion[] = [
  {
    id: "coding_style",
    title: "How do you plan to build this project?",
    helper: "Drives whether your curriculum is an agile 'vibe-coder' minimum or a deeper code-along.",
    options: [
      {
        id: "vibe",
        label: "Directing an AI coding agent (Vibe Coding)",
        recommendation: true,
      },
      {
        id: "mix",
        label: "A balanced mix of writing code and AI pairing",
      },
      {
        id: "myself",
        label: "Writing mostly all code myself to learn deeply",
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
        label: "Never coded before (first-time beginner)",
        recommendation: true,
      },
      {
        id: "beginner",
        label: "Know a little (familiar with basic HTML or variables)",
      },
      {
        id: "intermediate",
        label: "Build already (comfortable with syntax and Git)",
      },
    ],
  },
  {
    id: "time_budget",
    title: "How much time can you dedicate to this MVP?",
    helper: "Sizes your milestone cutline and foundations so you finish comfortably before demo day.",
    options: [
      {
        id: "standard",
        label: "2 hours / day for 7 days (~14 hours total)",
        recommendation: true,
      },
      {
        id: "weekend",
        label: "Weekend hackathon sprint (12–16 hours over 2 days)",
      },
      {
        id: "light",
        label: "1 hour / day for 5 days (~5 hours total)",
      },
    ],
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idea } = body;

    const lower = (idea || "").toLowerCase();

    // Contextual project question tailored to idea
    let projectSpecificQuestion: ClarifyingQuestion;

    if (lower.includes("cli") || lower.includes("terminal")) {
      projectSpecificQuestion = {
        id: "cli_input",
        title: "How will users supply input to your CLI tool?",
        helper: "Focuses the Phase 1 MVP parsing requirements.",
        options: [
          {
            id: "interactive_flags",
            label: "Terminal flags or interactive prompts (e.g. node app.js --file=data.txt)",
            recommendation: true,
          },
          {
            id: "piped_input",
            label: "Piping raw text streams directly from standard input",
          },
        ],
      };
    } else if (lower.includes("extension") || lower.includes("chrome")) {
      projectSpecificQuestion = {
        id: "extension_mode",
        title: "How should users trigger the browser extension?",
        helper: "Determines the Chrome Manifest entrypoint for your MVP.",
        options: [
          {
            id: "popup",
            label: "Clicking the extension icon opens a clean 360px popup window",
            recommendation: true,
          },
          {
            id: "page_overlay",
            label: "Injecting a floating button directly into the active webpage",
          },
        ],
      };
    } else {
      projectSpecificQuestion = {
        id: "mvp_storage",
        title: "Where should your MVP store user data during testing?",
        helper: "Zero-database local storage eliminates setup friction for demo day.",
        options: [
          {
            id: "local_storage",
            label: "Browser LocalStorage (100% offline, zero server or login required)",
            recommendation: true,
          },
          {
            id: "local_json_file",
            label: "A simple local JSON file on your machine",
          },
          {
            id: "cloud_database",
            label: "Cloud database with user accounts (Deferred to Level Up Later)",
          },
        ],
      };
    }

    const allQuestions: ClarifyingQuestion[] = [
      ...INTAKE_FOUNDATION_QUESTIONS,
      projectSpecificQuestion,
    ];

    return NextResponse.json({
      success: true,
      questions: allQuestions,
    });
  } catch (err: any) {
    console.error("[Questions Route] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate intake questions." },
      { status: 500 }
    );
  }
}
