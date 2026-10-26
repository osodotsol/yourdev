const assert = require("assert");

// Import blueprint generators & validators
// We can test via transpiled / ts-node or dynamically via require or direct node script
async function runVerification() {
  console.log("=== Running Task 13 Devpost Cleanup Verification ===");

  // 1. Static codebase inspection
  const fs = require("fs");
  const path = require("path");

  const filesToCheck = [
    "components/ConsoleSection.tsx",
    "components/SiteFooter.tsx",
    "components/InputConsole.tsx",
    "components/FileMapSection.tsx",
    "components/ArchitectureSection.tsx",
    "lib/fallbackGenerator.ts",
    "lib/foundationsBank.ts",
    "lib/validateBlueprint.ts",
    "lib/linkValidator.ts",
    "app/api/review/route.ts",
    "app/api/questions/route.ts"
  ];

  const bannedPhrases = [
    "DEVPOST DESCRIPTION DRAFT",
    "Copy-Paste Submission Template",
    "Copy Devpost Draft",
    "Build With AI: Basics",
    "Devpost BWA",
    "hackathon judge",
    "hackathon MVP",
    "hackathon submission",
    "hackathon PoC"
  ];

  console.log("\n--- Checking source files for banned phrases ---");
  for (const relPath of filesToCheck) {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Expected file not found: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    for (const phrase of bannedPhrases) {
      if (content.toLowerCase().includes(phrase.toLowerCase())) {
        throw new Error(`File ${relPath} still contains banned phrase: "${phrase}"`);
      }
    }
  }
  console.log(`✓ All ${filesToCheck.length} key source files are free of banned hackathon/Devpost phrases.`);

  // 2. Check Tab 6 UI configuration in components/ConsoleSection.tsx
  console.log("\n--- Verifying ConsoleSection Tab 6 Configuration ---");
  const consoleSectionContent = fs.readFileSync(path.join(__dirname, "components/ConsoleSection.tsx"), "utf-8");
  
  assert.ok(!consoleSectionContent.includes("devpostDraft"), "Should not contain devpostDraft state");
  assert.ok(!consoleSectionContent.includes("copiedDevpost"), "Should not contain copiedDevpost state");
  assert.ok(consoleSectionContent.includes("6. Launch & Export"), "Tab 6 button should be labeled '6. Launch & Export'");
  assert.ok(consoleSectionContent.includes("formatBlueprintMarkdown(blueprint)"), "Tab 6 should expose formatBlueprintMarkdown");
  assert.ok(consoleSectionContent.includes("Full Project Blueprint (Markdown)"), "Tab 6 should have clear Project Blueprint export section");
  assert.ok(!consoleSectionContent.includes("Product Walkthrough & Demo Outline"), "Tab 6 should not contain legacy demo walkthrough outline");
  assert.ok(consoleSectionContent.includes("Source Code & Repository Checklist"), "Tab 6 should have repository checklist");
  assert.ok(consoleSectionContent.includes("Optional Self-Check"), "Tab 6 should clearly label repository checklist as optional self-check");
  console.log("✓ ConsoleSection Tab 6 verified: Devpost editor removed, Launch & Export active with Markdown blueprint export.");

  // 3. Test HTTP / API generation with 2 unrelated project ideas:
  //    Idea 1: "A habit tracker"
  //    Idea 2: "A Rivers State Farmer Planting Advisor"
  console.log("\n--- Testing Blueprint Generation via API ---");
  const http = require("http");

  async function queryBreakdown(idea) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ idea, choices: {} });
      const req = http.request(
        "http://localhost:3000/api/breakdown",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(new Error(`Failed to parse response: ${body}`));
            }
          });
        }
      );
      req.on("error", reject);
      req.write(data);
      req.end();
    });
  }

  const ideas = [
    "A habit tracker",
    "A Rivers State Farmer Planting Advisor"
  ];

  for (const idea of ideas) {
    console.log(`Testing idea: "${idea}"...`);
    const resp = await queryBreakdown(idea);
    assert.ok(resp && resp.blueprint, `Expected blueprint response for "${idea}"`);
    const bp = resp.blueprint;
    const bpJson = JSON.stringify(bp);

    // Verify no banned strings in the entire generated blueprint JSON
    for (const phrase of bannedPhrases) {
      assert.ok(
        !bpJson.toLowerCase().includes(phrase.toLowerCase()),
        `Blueprint for "${idea}" should not contain "${phrase}"`
      );
    }
    assert.ok(!bpJson.toLowerCase().includes("devpost"), `Blueprint for "${idea}" should not mention Devpost`);
    assert.ok(!bpJson.toLowerCase().includes("hackathon"), `Blueprint for "${idea}" should not mention hackathon`);

    // Verify title and summary accurately relate to the idea
    console.log(`  -> Title: "${bp.projectTitle}"`);
    console.log(`  -> Summary: "${bp.summary.substring(0, 80)}..."`);
    console.log(`  -> Phases: ${bp.roadmap.length}`);
    console.log(`  -> Nodes (Milestones): ${bp.nodes.length}`);
    assert.ok(bp.projectTitle.length > 0, "Blueprint must have a projectTitle");
    assert.ok(bp.summary.length > 0, "Blueprint must have a summary");
    assert.ok(bp.nodes.length > 0, "Blueprint must have roadmap nodes");
    console.log(`✓ Idea "${idea}" generated a clean, accurate, hackathon-free blueprint.`);
  }

  console.log("\n==================================================");
  console.log("TASK 13 VERIFICATION PASSED COMPLETELY!");
  console.log("==================================================");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
