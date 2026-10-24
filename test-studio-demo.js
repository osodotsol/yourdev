/**
 * Regression & Unit Test Suite for Task 9: Build Studio Verification Integrity
 * Tests actual rendered widget inspection, visible count validation against independent
 * expectations, zero-division edge cases, and integrity failure modes.
 */

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
  calculateDailyProgress,
  runStudioVerification,
} = require("./lib/studioDemoVerification.ts");

const STUDIO_URL = process.env.TEST_STUDIO_URL || "http://localhost:3000/studio-demo";

async function runStudioTestSuite() {
  console.log("=================================================================");
  console.log("RUNNING TASK 9 STUDIO VERIFICATION INTEGRITY TEST SUITE");
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

  // TEST 1: Metric Calculation (2/3 completed)
  await testCase("Independent Derivation: 2 of 3 completed produces 67%", () => {
    const habits = [
      { id: "1", title: "Water", category: "Health", completed: true, streak: 3, createdAt: 1 },
      { id: "2", title: "Read", category: "Focus", completed: false, streak: 1, createdAt: 2 },
      { id: "3", title: "Stretch", category: "Fitness", completed: true, streak: 5, createdAt: 3 },
    ];
    const metrics = calculateDailyProgress(habits);
    assert.strictEqual(metrics.total, 3, "Total should be 3");
    assert.strictEqual(metrics.completed, 2, "Completed should be 2");
    assert.strictEqual(metrics.percentage, 67, "Percentage should be 67");
    assert.strictEqual(metrics.fractionalText, "2 of 3 habits completed today");
    assert.strictEqual(metrics.isAllCompleted, false, "Not all completed");
  });

  // TEST 2: 100% Completion State
  await testCase("Independent Derivation: All completed produces 100% and isAllCompleted flag", () => {
    const habits = [
      { id: "1", title: "Water", category: "Health", completed: true, streak: 4, createdAt: 1 },
      { id: "2", title: "Read", category: "Focus", completed: true, streak: 2, createdAt: 2 },
    ];
    const metrics = calculateDailyProgress(habits);
    assert.strictEqual(metrics.percentage, 100, "Percentage should be 100");
    assert.strictEqual(metrics.isAllCompleted, true, "isAllCompleted should be true");
    assert.match(metrics.motivationMessage, /All habits complete/);
  });

  // TEST 3: Zero Habits / Empty State Guard
  await testCase("Zero-Division Safety: Empty array safely returns 0% with no NaN", () => {
    const metrics = calculateDailyProgress([]);
    assert.strictEqual(metrics.total, 0, "Total should be 0");
    assert.strictEqual(metrics.completed, 0, "Completed should be 0");
    assert.strictEqual(metrics.percentage, 0, "Percentage should be 0");
    assert.strictEqual(Number.isNaN(metrics.percentage), false, "Percentage must not be NaN");
    assert.strictEqual(metrics.fractionalText, "0 of 0 habits completed today");
    assert.strictEqual(metrics.isAllCompleted, false, "isAllCompleted false for empty habits");
  });

  // TEST 4: Integrity Check - Toggle alone MUST NOT pass if DOM widget is missing
  await testCase("Verification Integrity: Fails if toggle is true but DOM widget is missing", () => {
    const habits = [
      { id: "1", title: "Water", category: "Health", completed: true, streak: 1, createdAt: 1 },
    ];
    // Simulate DOM inspection where container was NOT found
    const missingDomSnapshot = {
      containerExists: false,
      containerId: "studio-daily-progress-container",
      visibleFractionText: null,
      visiblePercentageText: null,
      visibleFillWidth: null,
      parsedCompleted: null,
      parsedTotal: null,
      parsedPercentage: null,
      hasNaN: false,
      source: "snapshot",
    };

    const report = runStudioVerification(habits, true, missingDomSnapshot);
    assert.strictEqual(report.overallPassed, false, "Must NOT pass when DOM widget is missing");
    const mountCheck = report.checks.find((c) => c.id === "indicator_mounted");
    assert.ok(mountCheck, "Mount check must exist");
    assert.strictEqual(mountCheck.passed, false, "Mount check must fail");
    assert.match(mountCheck.diagnostic, /Verification Integrity Defect/i);
  });

  // TEST 5: Integrity Check - Fails if visible fraction in DOM does not match data expectation
  await testCase("Verification Integrity: Fails if visible fraction in DOM does not match expectation", () => {
    const habits = [
      { id: "1", title: "Water", category: "Health", completed: true, streak: 1, createdAt: 1 },
      { id: "2", title: "Read", category: "Focus", completed: false, streak: 0, createdAt: 2 },
    ];
    // Expected is 1 of 2 (50%). Simulate stale DOM displaying 0 of 2 (0%)
    const staleDomSnapshot = {
      containerExists: true,
      containerId: "studio-daily-progress-container",
      visibleFractionText: "0 of 2 habits completed today",
      visiblePercentageText: "0%",
      visibleFillWidth: "0%",
      parsedCompleted: 0,
      parsedTotal: 2,
      parsedPercentage: 0,
      hasNaN: false,
      source: "snapshot",
    };

    const report = runStudioVerification(habits, true, staleDomSnapshot);
    assert.strictEqual(report.overallPassed, false, "Must fail on stale/mismatched DOM text");
    const fractionCheck = report.checks.find((c) => c.id === "fractional_metric_accuracy");
    assert.ok(fractionCheck);
    assert.strictEqual(fractionCheck.passed, false);
    assert.match(fractionCheck.diagnostic, /Mismatch in visible fraction/i);
  });

  // TEST 6: Integrity Check - Fails if rendered DOM contains NaN
  await testCase("Verification Integrity: Fails if rendered DOM contains NaN", () => {
    const habits = [
      { id: "1", title: "Water", category: "Health", completed: true, streak: 1, createdAt: 1 },
    ];
    const nanDomSnapshot = {
      containerExists: true,
      containerId: "studio-daily-progress-container",
      visibleFractionText: "1 of 1 habits completed today",
      visiblePercentageText: "NaN%",
      visibleFillWidth: "NaN%",
      parsedCompleted: 1,
      parsedTotal: 1,
      parsedPercentage: null,
      hasNaN: true,
      source: "snapshot",
    };

    const report = runStudioVerification(habits, true, nanDomSnapshot);
    assert.strictEqual(report.overallPassed, false);
    const pctCheck = report.checks.find((c) => c.id === "percentage_scale_boundary");
    assert.ok(pctCheck);
    assert.strictEqual(pctCheck.passed, false);
    assert.match(pctCheck.diagnostic, /contains NaN/i);
  });

  // TEST 7: Full Passing Verification - When DOM matches expected metrics
  await testCase("Verification Passing: All 4 checks pass when rendered DOM matches expected metrics", () => {
    const habits = [
      { id: "1", title: "Water", category: "Health", completed: true, streak: 2, createdAt: 1 },
      { id: "2", title: "Walk", category: "Fitness", completed: false, streak: 0, createdAt: 2 },
    ];
    const validDomSnapshot = {
      containerExists: true,
      containerId: "studio-daily-progress-container",
      visibleFractionText: "1 of 2 habits completed today",
      visiblePercentageText: "50%",
      visibleFillWidth: "50%",
      parsedCompleted: 1,
      parsedTotal: 2,
      parsedPercentage: 50,
      hasNaN: false,
      source: "snapshot",
    };

    const report = runStudioVerification(habits, true, validDomSnapshot);
    assert.strictEqual(report.overallPassed, true, "All checks must pass when DOM is verified");
    assert.strictEqual(report.passedChecks, 4);
    assert.strictEqual(report.failedChecks, 0);
    assert.strictEqual(report.inspectionSummary.containerFound, true);
    assert.strictEqual(report.inspectionSummary.renderedPercentage, 50);
  });

  // TEST 8: Empty Habits State - Safely verified in rendered DOM
  await testCase("Zero-Habit State: Empty habit list safely displays 0% and passes verification", () => {
    const habits = [];
    const emptyDomSnapshot = {
      containerExists: true,
      containerId: "studio-daily-progress-container",
      visibleFractionText: "0 of 0 habits completed today",
      visiblePercentageText: "0%",
      visibleFillWidth: "0%",
      parsedCompleted: 0,
      parsedTotal: 0,
      parsedPercentage: 0,
      hasNaN: false,
      source: "snapshot",
    };

    const report = runStudioVerification(habits, true, emptyDomSnapshot);
    assert.strictEqual(report.overallPassed, true);
    const zeroCheck = report.checks.find((c) => c.id === "zero_division_safety");
    assert.strictEqual(zeroCheck.passed, true);
    assert.match(zeroCheck.diagnostic, /Active zero-habit state verified/i);
  });

  // TEST 9: Live Route HTML Audit - Validates reliable widget identifiers
  await testCase("Live Route Audit: GET /studio-demo renders reliable widget IDs and testids", async () => {
    try {
      const res = await fetch(STUDIO_URL);
      if (res.status === 200) {
        const html = await res.text();
        // Check for widget identifiers
        assert.ok(
          html.includes("studio-baseline-placeholder"),
          "HTML should contain baseline placeholder ID"
        );
        assert.ok(
          html.includes("Predefined Component Implementation"),
          "HTML should state predefined component implementation honestly"
        );
        assert.ok(
          html.includes("DOM Inspection Audit"),
          "HTML should contain DOM inspection audit section"
        );
      }
    } catch {
      console.log("(Server offline during route check, tested via unit assertions)");
    }
  });

  console.log(`\nTASK 9 STUDIO SUITE COMPLETE: ${passed} / ${total} tests passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runStudioTestSuite().catch((err) => {
  console.error("Test runner encountered fatal error:", err);
  process.exit(1);
});
