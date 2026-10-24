/**
 * Security Remediation Test Suite — Task 1 Verification
 * Covers:
 * 1. String boundary enforcement (1,500 chars for idea, 8,000 for submission, etc.)
 * 2. Sensitive credential redaction in logs and diagnostic outputs
 * 3. Next.js Image Optimization API vector disabling (/_next/image returns 404)
 * 4. Standard HTTP security headers enforcement
 * 5. Production test hook protection invariants
 */

const assert = require("assert");
const fs = require("fs");
const ts = require("typescript");

// Register lightweight TypeScript hook for lib/redact.ts
require.extensions[".ts"] = function (module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  return module._compile(transpiled.outputText, filename);
};

const { redactSensitive, sanitizeLogMessage } = require("./lib/redact.ts");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function postJson(path, body, headers = {}) {
  const isString = typeof body === "string";
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: isString ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // text remains
  }
  return { status: res.status, headers: res.headers, json, text };
}

async function runSecurityTestSuite() {
  console.log("=================================================================");
  console.log("RUNNING SECURITY REMEDIATION TEST SUITE (TASK 1)");
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

  // --- 1. REDACTION & LOG INTEGRITY TESTS ---

  await testCase("Redaction: Synthetic Gemini URL query parameter ?key=... is masked", () => {
    const fakeKey = "AIzaSyD_FakeSecretTestKey_1234567890ABCDEF";
    const sensitiveUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${fakeKey}`;
    const cleaned = redactSensitive(sensitiveUrl);

    assert.ok(!cleaned.includes(fakeKey), "Cleaned URL must not contain the fake key");
    assert.ok(cleaned.includes("?key=[REDACTED]"), `Expected [REDACTED], got: ${cleaned}`);
  });

  await testCase("Redaction: Synthetic Gemini URL query parameter &key=... is masked", () => {
    const fakeKey = "AIzaSyD_FakeSecretTestKey_9876543210ZYXWVU";
    const sensitiveUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?alt=json&key=${fakeKey}&timeout=5000`;
    const cleaned = redactSensitive(sensitiveUrl);

    assert.ok(!cleaned.includes(fakeKey), "Cleaned URL must not contain the fake key");
    assert.ok(cleaned.includes("&key=[REDACTED]"), `Expected &key=[REDACTED], got: ${cleaned}`);
  });

  await testCase("Redaction: Raw AIza key strings in error messages are masked", () => {
    const fakeKey = "AIzaSyFakeKey12345678901234567890123";
    const errorText = `Connection refused to Google API using credential ${fakeKey} at socket 443`;
    const cleaned = redactSensitive(errorText);

    assert.ok(!cleaned.includes(fakeKey), "Cleaned text must not contain the raw API key");
    assert.ok(cleaned.includes("[REDACTED_API_KEY]"), `Expected [REDACTED_API_KEY], got: ${cleaned}`);
  });

  await testCase("Redaction: Bearer token in log messages is masked", () => {
    const bearer = "Bearer ya29.a0AfH6SMB_secret_bearer_token_here";
    const cleaned = redactSensitive(`Authorization header: ${bearer}`);

    assert.ok(!cleaned.includes("ya29.a0AfH6SMB"), "Cleaned text must not contain the bearer token");
    assert.ok(cleaned.includes("Bearer [REDACTED]"), `Expected Bearer [REDACTED], got: ${cleaned}`);
  });

  await testCase("Log Sanitization: sanitizeLogMessage formats Error objects and masks credentials", () => {
    const fakeKey = "AIzaSyD_ErrorObjectTestKey_4567890123";
    const err = new Error(`Upstream fetch failed: https://generativelanguage.googleapis.com/v1beta/models?key=${fakeKey}`);
    const sanitized = sanitizeLogMessage(err, 200);

    assert.ok(!sanitized.includes(fakeKey), "Sanitized log must not contain the API key");
    assert.ok(sanitized.includes("?key=[REDACTED]"), "Sanitized log must contain ?key=[REDACTED]");
    assert.ok(sanitized.length <= 203, "Sanitized log must obey length bounding");
  });

  await testCase("Console Capture: Injected synthetic error into logger outputs no sensitive key", () => {
    const fakeKey = "AIzaSyD_CapturedLogKey_7777777777";
    const interceptedLogs = [];
    const originalWarn = console.warn;

    try {
      console.warn = (...args) => {
        interceptedLogs.push(args.map(String).join(" "));
      };

      // Simulate an error logged via sanitizeLogMessage
      const errorMsg = `Fetch error: https://generativelanguage.googleapis.com/api?key=${fakeKey}`;
      console.warn("[Simulated Gemini Route]", sanitizeLogMessage(errorMsg));

      assert.strictEqual(interceptedLogs.length, 1);
      assert.ok(!interceptedLogs[0].includes(fakeKey), "Intercepted log must not contain the key!");
      assert.ok(interceptedLogs[0].includes("[REDACTED]"), "Intercepted log must contain [REDACTED]");
    } finally {
      console.warn = originalWarn;
    }
  });

  // --- 2. API INPUT BOUNDARIES (HTTP 400 ENFORCEMENT) ---

  await testCase("Boundary /api/breakdown: Oversized project idea (1501 chars) returns 400", async () => {
    const oversizedIdea = "A".repeat(1501);
    const { status, json } = await postJson("/api/breakdown", { idea: oversizedIdea });

    assert.strictEqual(status, 400);
    assert.match(json.error, /exceeds maximum allowed length of 1,500 characters/i);
  });

  await testCase("Boundary /api/breakdown: Upper-bound project idea (1500 chars) is accepted", async () => {
    // 1500 chars of valid text
    const maxIdea = "Build a lightweight habit tracker for students ".repeat(31).slice(0, 1500);
    const { status, json } = await postJson("/api/breakdown", {
      idea: maxIdea,
      simulateFailure: "all", // fast fallback in test mode
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.source, "fallback");
  });

  await testCase("Boundary /api/breakdown: Malformed JSON or non-object body returns 400", async () => {
    const { status: s1, json: j1 } = await postJson("/api/breakdown", "{ malformed json");
    assert.strictEqual(s1, 400);
    assert.strictEqual(j1.error, "Invalid JSON request body.");

    const { status: s2, json: j2 } = await postJson("/api/breakdown", JSON.stringify(["an", "array"]));
    assert.strictEqual(s2, 400);
    assert.strictEqual(j2.error, "Invalid JSON request body.");
  });

  await testCase("Boundary /api/breakdown: Invalid choices type (string instead of object) returns 400", async () => {
    const { status, json } = await postJson("/api/breakdown", {
      idea: "Valid project idea with 20 characters",
      choices: "not-an-object",
    });

    assert.strictEqual(status, 400);
    assert.match(json.error, /choices must be an object/i);
  });

  await testCase("Boundary /api/architecture: Oversized idea (1501 chars) returns 400", async () => {
    const oversizedIdea = "B".repeat(1501);
    const { status, json } = await postJson("/api/architecture", { idea: oversizedIdea });

    assert.strictEqual(status, 400);
    assert.match(json.error, /exceeds maximum allowed length of 1,500 characters/i);
  });

  await testCase("Boundary /api/architecture: Malformed JSON body returns 400", async () => {
    const { status, json } = await postJson("/api/architecture", "not valid json");
    assert.strictEqual(status, 400);
    assert.strictEqual(json.error, "Invalid JSON request body.");
  });

  await testCase("Boundary /api/review: Oversized submission (8001 chars) returns 400", async () => {
    const oversizedSubmission = "C".repeat(8001);
    const { status, json } = await postJson("/api/review", {
      milestone: { id: "node-1", step: 1, title: "Test", goal: "Test", filesToCreate: ["test.ts"], keyPackages: [] },
      submission: oversizedSubmission,
    });

    assert.strictEqual(status, 400);
    assert.match(json.error, /exceeds maximum allowed length of 8,000 characters/i);
  });

  await testCase("Boundary /api/review: Upper-bound submission (8000 chars) is accepted", async () => {
    const maxSubmission = "const x = 1; ".repeat(571).slice(0, 8000);
    const { status, json } = await postJson("/api/review", {
      milestone: { id: "node-1", step: 1, title: "Test", goal: "Test", filesToCreate: ["test.ts"], keyPackages: [] },
      submission: maxSubmission,
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.review);
  });

  await testCase("Boundary /api/review: Oversized project context idea (1501 chars) returns 400", async () => {
    const { status, json } = await postJson("/api/review", {
      idea: "D".repeat(1501),
      milestone: { id: "node-1", step: 1, title: "Test", goal: "Test", filesToCreate: ["test.ts"], keyPackages: [] },
      submission: "Valid code submission for review",
    });

    assert.strictEqual(status, 400);
    assert.match(json.error, /project idea must be a string not exceeding 1,500 characters/i);
  });

  await testCase("Boundary /api/review: Oversized filename (256 chars) returns 400", async () => {
    const { status, json } = await postJson("/api/review", {
      milestone: { id: "node-1" },
      submission: "{}",
      submissionType: "artifact",
      filename: "F".repeat(256),
    });

    assert.strictEqual(status, 400);
    assert.match(json.error, /filename must be a string not exceeding 255 characters/i);
  });

  await testCase("Boundary /api/questions: Oversized idea (1501 chars) returns 400", async () => {
    const { status, json } = await postJson("/api/questions", { idea: "E".repeat(1501) });

    assert.strictEqual(status, 400);
    assert.match(json.error, /project idea must be a string not exceeding 1,500 characters/i);
  });

  await testCase("Boundary /api/questions: Valid idea returns 200 and questions list", async () => {
    const { status, json } = await postJson("/api/questions", { idea: "A Chrome extension to save bookmarks" });

    assert.strictEqual(status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.questions));
    assert.strictEqual(json.questions.length, 4);
  });

  // --- 3. FRAMEWORK HARDENING & SECURITY HEADERS ---

  await testCase("Framework: Next.js Image Optimization API /_next/image returns 404 (Unoptimized)", async () => {
    const res = await fetch(`${BASE_URL}/_next/image?url=%2Ftest.svg&w=64&q=75`);
    assert.strictEqual(res.status, 404, `Expected 404 for disabled /_next/image, got ${res.status}`);
  });

  await testCase("Security Headers: Response includes nosniff, DENY, and strict-origin-when-cross-origin", async () => {
    const res = await fetch(`${BASE_URL}/studio-demo`);
    assert.strictEqual(res.status, 200);

    const nosniff = res.headers.get("x-content-type-options");
    const frameOptions = res.headers.get("x-frame-options");
    const referrerPolicy = res.headers.get("referrer-policy");

    assert.strictEqual(nosniff, "nosniff", "x-content-type-options must be nosniff");
    assert.strictEqual(frameOptions, "DENY", "x-frame-options must be DENY");
    assert.strictEqual(referrerPolicy, "strict-origin-when-cross-origin", "referrer-policy must be strict-origin-when-cross-origin");
  });

  await testCase("Framework: sharp package is confirmed absent from node_modules", () => {
    let installed = true;
    try {
      require("sharp");
    } catch {
      installed = false;
    }
    assert.strictEqual(installed, false, "sharp package must NOT be installed in this project");
  });

  // --- 4. PRODUCTION TEST-HOOK SECURITY INVARIANTS ---

  await testCase("Production Protection: x-simulate-production header blocks test-hook injection", async () => {
    const { status, json } = await postJson(
      "/api/breakdown",
      {
        idea: "A habit tracking web app for daily routines",
        mockArchitecture: { project_type: "forged" },
        simulateFailure: "call2",
        timeoutMs: 50, // Short timeout should be ignored in production simulation!
      },
      { "x-simulate-production": "true" }
    );

    assert.strictEqual(status, 200);
    // In simulated production, mockArchitecture is completely ignored
    assert.notStrictEqual(json.blueprint?.architecture?.project_type, "forged");
  });

  console.log(`\nSECURITY REMEDIATION TEST SUITE COMPLETE: ${passed} / ${total} tests passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runSecurityTestSuite().catch((err) => {
  console.error("Fatal test runner failure:", err);
  process.exit(1);
});
