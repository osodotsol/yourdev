const assert = require("assert");
const fs = require("fs");
const path = require("path");
const http = require("http");

async function runTask12Tests() {
  console.log("==================================================");
  console.log("RUNNING TASK 12 VISUAL REFINEMENT VERIFICATION");
  console.log("==================================================\n");

  // 1. Static checks on components
  console.log("--- 1. Checking refined components for clean typography & positioning ---");
  const heroContent = fs.readFileSync(path.join(__dirname, "components/HeroSection.tsx"), "utf-8");
  assert.ok(heroContent.includes("Build real software."), "Hero headline updated");
  assert.ok(heroContent.includes("From idea to verified code."), "Hero subtitle updated");
  assert.ok(!heroContent.includes("The to-do list that builds it"), "Old to-do list headline removed from Hero");
  assert.ok(heroContent.includes("Inspect output blueprint"), "Button label updated to output blueprint");

  const footerContent = fs.readFileSync(path.join(__dirname, "components/SiteFooter.tsx"), "utf-8");
  assert.ok(footerContent.includes("Build real software. Understand every step."), "Footer positioning updated");
  assert.ok(footerContent.includes("wordmarkColor=\"#ffffff\""), "Footer wordmark has explicit high contrast color");
  assert.ok(!footerContent.includes("The to-do list that builds your vision"), "Old tagline removed from footer");

  const studioDemoContent = fs.readFileSync(path.join(__dirname, "app/studio-demo/page.tsx"), "utf-8");
  assert.ok(!studioDemoContent.includes("animate-bounce"), "Jarring bounce animation removed from studio badge");
  assert.ok(studioDemoContent.includes("id=\"studio-completion-badge\""), "Studio completion badge preserved for test suite");
  console.log("✓ Component copy, contrast, and layout styling verified.");

  // 2. Markdown Parser & AST Verification
  console.log("\n--- 2. Markdown Parser & AST Verification ---");
  const ts = require("typescript");
  const parserSource = fs.readFileSync(path.join(__dirname, "lib/markdownParser.ts"), "utf-8");
  const transpiled = ts.transpileModule(parserSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const moduleObj = { exports: {} };
  const fn = new Function("module", "exports", transpiled.outputText);
  fn(moduleObj, moduleObj.exports);
  const { parseMarkdown, parseInline, sanitizeUrl } = moduleObj.exports;

  // Test code snippet with language & indentation
  const mdWithCode = `
# Project Blueprint: Smart Planting Advisor

This guide helps farmers in **Rivers State** optimize planting dates.

\`\`\`typescript
interface CropRecommendation {
  cropName: string;
  optimalMonth: string;
  soilMoistureThreshold: number;
}
\`\`\`

## Key Requirements:
1. Rainfall prediction integration
2. Offline soil handbook:
   - Soil pH guidance
   - Organic compost ratios
3. SMS broadcast alerts

> Note: Rivers State experiences peak precipitation between June and September.

| Crop | Best Month | Spacing |
| :--- | :---: | ---: |
| Cassava | March - May | 1m x 1m |
| Yam | November - Dec | 1.2m x 1m |
| Maize | March - April | 75cm x 25cm |
`;

  const ast = parseMarkdown(mdWithCode);
  assert.ok(ast.length >= 6, "Expected at least 6 block nodes");
  const heading1 = ast.find((b) => b.type === "heading" && b.level === 1);
  assert.ok(heading1, "H1 parsed");
  const codeBlock = ast.find((b) => b.type === "codeBlock");
  assert.ok(codeBlock && codeBlock.language === "typescript", "TypeScript code block parsed");
  assert.ok(codeBlock.code.includes("interface CropRecommendation"), "Code content preserved verbatim");

  const listBlock = ast.find((b) => b.type === "list" && b.ordered === true);
  assert.ok(listBlock, "Ordered list parsed");
  assert.ok(listBlock.items.length === 3, "List has 3 items");
  assert.ok(listBlock.items[1].subList, "Nested sub-list parsed for item 2");
  assert.ok(listBlock.items[1].subList.items.length === 2, "Nested sub-list has 2 items");

  const blockquote = ast.find((b) => b.type === "blockquote");
  assert.ok(blockquote, "Blockquote parsed");

  const table = ast.find((b) => b.type === "table");
  assert.ok(table, "Table parsed");
  assert.strictEqual(table.headers.cells.length, 3, "Table has 3 headers");
  assert.strictEqual(table.rows.length, 3, "Table has 3 data rows");
  assert.strictEqual(table.headers.cells[0].align, "left", "Header 1 left-aligned");
  assert.strictEqual(table.headers.cells[1].align, "center", "Header 2 center-aligned");
  assert.strictEqual(table.headers.cells[2].align, "right", "Header 3 right-aligned");
  console.log("✓ Markdown AST handles headings, code fences, nested lists, blockquotes, and aligned tables.");

  // 3. Test 3 Unrelated Project Ideas via API
  console.log("\n--- 3. Testing 3 Unrelated Project Ideas via Breakdown API ---");
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

  const ideasToTest = [
    "A habit tracker with streak momentum, local storage, and confetti celebration",
    "A Rivers State Farmer Planting Advisor with crop calendars, rainfall patterns, and soil tips",
    "A Chrome Extension Article Summarizer with manifest v3, popup UI, and keyboard shortcuts"
  ];

  for (const idea of ideasToTest) {
    console.log(`Testing Idea: "${idea}"...`);
    const resp = await queryBreakdown(idea);
    assert.ok(resp && resp.blueprint, "Expected valid blueprint in response");
    const bp = resp.blueprint;
    assert.ok(bp.projectTitle && bp.projectTitle.length > 0, "Blueprint has projectTitle");
    assert.ok(bp.summary && bp.summary.length > 0, "Blueprint has summary");
    assert.ok(bp.nodes && bp.nodes.length >= 3, "Blueprint has at least 3 nodes");
    assert.ok(bp.roadmap && bp.roadmap.length >= 3, "Blueprint has at least 3 roadmap phases");

    // Test that the blueprint summary and strategy parse cleanly into Markdown AST
    const summaryAst = parseMarkdown(bp.summary);
    assert.ok(summaryAst.length > 0, "Summary parsed to AST");

    console.log(`  -> Title: "${bp.projectTitle}"`);
    console.log(`  -> Phases: ${bp.roadmap.length}, Nodes: ${bp.nodes.length}`);
    console.log(`✓ "${idea}" generated and validated cleanly.`);
  }

  console.log("\n==================================================");
  console.log("ALL TASK 12 REFINEMENT TESTS PASSED CLEANLY!");
  console.log("==================================================");
}

runTask12Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
