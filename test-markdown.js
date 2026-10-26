/**
 * Test Suite for Task 12: Markdown Parsing, Rendering, and Security Verification
 */
const assert = require("assert");
const fs = require("fs");
const ts = require("typescript");

const path = require("path");

// Register lightweight TypeScript hook with @/ alias resolution
const originalResolve = require("module")._resolveFilename;
require("module")._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(__dirname, request.slice(2));
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

require.extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  return module._compile(transpiled.outputText, filename);
};

const {
  parseMarkdown,
  parseInline,
  sanitizeUrl,
} = require("./lib/markdownParser.ts");
const { formatBlueprintMarkdown } = require("./lib/clipboard.ts");
const { generateBlueprint } = require("./lib/fallbackGenerator.ts");

console.log("=== Running Task 12 Markdown & Security Test Suite ===\n");

// 1. Security: Unsafe URL sanitization
console.log("Test 1: Link Safety & URL Sanitization");
assert.strictEqual(sanitizeUrl("javascript:alert(1)"), null, "javascript: URL must be blocked");
assert.strictEqual(sanitizeUrl("JAVASCRIPT:alert(1)"), null, "case-insensitive javascript: must be blocked");
assert.strictEqual(sanitizeUrl("data:text/html,<script>alert(1)</script>"), null, "data: URL must be blocked");
assert.strictEqual(sanitizeUrl("vbscript:msgbox(1)"), null, "vbscript: URL must be blocked");
assert.strictEqual(sanitizeUrl("file:///etc/passwd"), null, "file: URL must be blocked");
assert.strictEqual(sanitizeUrl("https://example.com/docs"), "https://example.com/docs", "https: URL must pass");
assert.strictEqual(sanitizeUrl("http://localhost:3000/api"), "http://localhost:3000/api", "http: URL must pass");
assert.strictEqual(sanitizeUrl("mailto:mentor@yourdev.dev"), "mailto:mentor@yourdev.dev", "mailto: URL must pass");
assert.strictEqual(sanitizeUrl("#section-1"), "#section-1", "anchor hash must pass");
assert.strictEqual(sanitizeUrl("/studio-demo"), "/studio-demo", "relative route must pass");
console.log("✓ Test 1 Passed: Unsafe URLs strictly blocked, safe URLs preserved.\n");

// 2. Headings Parsing
console.log("Test 2: Headings (levels 1-6)");
const headingMarkdown = `
# Level 1 Heading
## Level 2 Heading
### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading
`;
const headingBlocks = parseMarkdown(headingMarkdown);
assert.strictEqual(headingBlocks.length, 6, "Must produce 6 heading blocks");
for (let lvl = 1; lvl <= 6; lvl++) {
  assert.strictEqual(headingBlocks[lvl - 1].type, "heading");
  assert.strictEqual(headingBlocks[lvl - 1].level, lvl);
  assert.strictEqual(headingBlocks[lvl - 1].children[0].value, `Level ${lvl} Heading`);
}
console.log("✓ Test 2 Passed: Headings 1-6 parsed correctly.\n");

// 3. Fenced Code Blocks
console.log("Test 3: Fenced Code Blocks");
const codeBlockMd = `
\`\`\`typescript
interface User {
  id: string;
  name: string;
}
export const admin: User = { id: "1", name: "Admin" };
\`\`\`
`;
const codeBlocks = parseMarkdown(codeBlockMd);
assert.strictEqual(codeBlocks.length, 1);
assert.strictEqual(codeBlocks[0].type, "codeBlock");
assert.strictEqual(codeBlocks[0].language, "typescript");
assert(codeBlocks[0].code.includes("interface User"));
assert(codeBlocks[0].code.includes("export const admin"));
console.log("✓ Test 3 Passed: Code fences preserve language and code verbatim.\n");

// 4. Nested Lists (Ordered & Unordered)
console.log("Test 4: Lists & Nested Lists");
const listMd = `
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2
- Item 3

1. Step 1
2. Step 2
`;
const listBlocks = parseMarkdown(listMd);
assert.strictEqual(listBlocks.length, 2, "Must produce 2 distinct list blocks");
assert.strictEqual(listBlocks[0].type, "list");
assert.strictEqual(listBlocks[0].ordered, false);
assert.strictEqual(listBlocks[0].items.length, 3);
assert(listBlocks[0].items[1].subList, "Item 2 must have subList");
assert.strictEqual(listBlocks[0].items[1].subList.items.length, 2);

assert.strictEqual(listBlocks[1].type, "list");
assert.strictEqual(listBlocks[1].ordered, true);
assert.strictEqual(listBlocks[1].items.length, 2);
console.log("✓ Test 4 Passed: Unordered, ordered, and nested lists parsed correctly.\n");

// 5. Tables
console.log("Test 5: Tables with Alignments");
const tableMd = `
| Milestone | Status | Duration |
| :--- | :---: | ---: |
| 01 Setup | Completed | 30m |
| 02 Logic | In Progress | 60m |
`;
const tableBlocks = parseMarkdown(tableMd);
assert.strictEqual(tableBlocks.length, 1);
assert.strictEqual(tableBlocks[0].type, "table");
assert.strictEqual(tableBlocks[0].headers.cells.length, 3);
assert.strictEqual(tableBlocks[0].headers.cells[0].align, "left");
assert.strictEqual(tableBlocks[0].headers.cells[1].align, "center");
assert.strictEqual(tableBlocks[0].headers.cells[2].align, "right");
assert.strictEqual(tableBlocks[0].rows.length, 2);
assert.strictEqual(tableBlocks[0].rows[0].cells[0].children[0].value, "01 Setup");
console.log("✓ Test 5 Passed: Markdown tables parsed with proper column alignment.\n");

// 6. Blockquotes and Horizontal Rules
console.log("Test 6: Blockquotes & Horizontal Rules");
const bqMd = `
> Important note: Always test zero-db first.
> Continuous verification ensures reliability.

---
`;
const bqBlocks = parseMarkdown(bqMd);
assert.strictEqual(bqBlocks.length, 2);
assert.strictEqual(bqBlocks[0].type, "blockquote");
assert.strictEqual(bqBlocks[1].type, "horizontalRule");
console.log("✓ Test 6 Passed: Blockquotes and horizontal rules parsed correctly.\n");

// 7. Inline Formatting: Bold, Italic, Code, Links
console.log("Test 7: Inline Formatting");
const inlineText = "This has **bold text**, *italic text*, `code snippet`, and [YourDev](https://yourdev.studio).";
const inlines = parseInline(inlineText);
const types = inlines.map((n) => n.type);
assert(types.includes("strong"), "Must contain strong node");
assert(types.includes("emphasis"), "Must contain emphasis node");
assert(types.includes("inlineCode"), "Must contain inlineCode node");
assert(types.includes("link"), "Must contain link node");
const linkNode = inlines.find((n) => n.type === "link");
assert.strictEqual(linkNode.url, "https://yourdev.studio");
assert.strictEqual(linkNode.text, "YourDev");
console.log("✓ Test 7 Passed: Inline bold, italic, code, and links parsed correctly.\n");

// 8. Unclosed / Malformed Markdown Resilience
console.log("Test 8: Malformed Markdown Handling");
const malformed = "Unclosed `code block and unclosed **bold with no closing tags [bad link](javascript:void(0))";
const malformedNodes = parseInline(malformed);
assert(malformedNodes.length > 0, "Parser must not throw on malformed syntax");
// Verify malicious link is neutralized to text
const badLink = malformedNodes.find((n) => n.type === "link");
assert.strictEqual(badLink, undefined, "Unsafe javascript: link must not produce a link node");
console.log("✓ Test 8 Passed: Malformed markdown handled gracefully without throwing.\n");

// 9. Original Markdown Export Preservation
console.log("Test 9: Clipboard Export Pristine Markdown");
const blueprint = generateBlueprint("Habit tracker with daily streaks");
const exportMarkdown = formatBlueprintMarkdown(blueprint);
assert(exportMarkdown.startsWith("# Project Blueprint:"), "Must start with H1 project blueprint");
assert(exportMarkdown.includes("## Strategic Architecture Decision"), "Must contain H2 architecture decision");
assert(exportMarkdown.includes("## Start Here: Your First 20 Minutes"), "Must contain First 20 Minutes");
assert(exportMarkdown.includes("## Recommended Tech Stack"), "Must contain Tech Stack");
assert(exportMarkdown.includes("### First Prompt to Send to Your Coding Agent"), "Must contain First Prompt");
assert(exportMarkdown.includes("```"), "Must contain intact code fence for agent prompt");
console.log("✓ Test 9 Passed: Raw exported Markdown string is completely intact and uncorrupted.\n");

console.log("==================================================");
console.log("ALL 9 MARKDOWN & SECURITY TESTS PASSED CLEANLY!");
console.log("==================================================");
