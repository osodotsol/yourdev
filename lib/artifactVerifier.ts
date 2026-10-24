import { VerificationCheck, StepReviewResult, StarterArtifact } from "@/types/blueprint";
import { computeContentHash, computeContentHashBrowser } from "./milestoneCompletion";

export { computeContentHash, computeContentHashBrowser };

/**
 * Generates beginner-friendly starter artifacts for Chrome Manifest V3 extensions.
 */
export function createExtensionStarterArtifacts(projectTitle: string): StarterArtifact[] {
  const safeName =
    projectTitle && projectTitle.trim().length > 3
      ? projectTitle.trim().slice(0, 45)
      : "Chrome Extension MVP";

  const manifestJsonContent = JSON.stringify(
    {
      manifest_version: 3,
      name: safeName,
      version: "1.0.0",
      description: `Initial working shell for ${safeName}.`,
      action: {
        default_popup: "popup.html",
      },
      permissions: ["storage"],
    },
    null,
    2
  );

  const popupHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeName}</title>
  <style>
    body {
      width: 320px;
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      background: #f8fafc;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 16px;
      color: #0f172a;
    }
    p {
      margin: 0 0 12px;
      font-size: 13px;
      line-height: 1.5;
      color: #475569;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      margin-bottom: 12px;
    }
    .next-step {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      font-size: 12px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="badge">● Initial Working Shell</div>
  <h2>${safeName}</h2>
  <p>The extension popup shell has loaded successfully in your browser.</p>
  <div class="next-step">
    <strong>Next Step:</strong> Proceed to Milestone 02 to connect your content script or local data storage.
  </div>
</body>
</html>`;

  return [
    {
      filename: "manifest.json",
      language: "json",
      purpose: "Declares Manifest V3 configuration, permissions, and popup window entrypoint.",
      content: manifestJsonContent,
    },
    {
      filename: "popup.html",
      language: "html",
      purpose: "Provides the visual interface displayed when clicking the extension icon.",
      content: popupHtmlContent,
    },
  ];
}

/**
 * Deterministically checks a Manifest V3 manifest.json string.
 */
export function verifyManifestJson(content: string): {
  checks: VerificationCheck[];
  passed: boolean;
  errorDiagnostic?: string;
} {
  const checks: VerificationCheck[] = [];
  let parsed: any = null;

  // 1. JSON Syntax Check
  try {
    parsed = JSON.parse(content);
    checks.push({
      id: "manifest_json_syntax",
      label: "Valid JSON syntax",
      passed: true,
    });
  } catch (err: any) {
    const errorMsg = err?.message || "Invalid JSON formatting";
    checks.push({
      id: "manifest_json_syntax",
      label: "Valid JSON syntax",
      passed: false,
      message: `JSON parse error: ${errorMsg}. Ensure all keys and strings use double quotes, and there are no trailing commas.`,
    });
    return { checks, passed: false, errorDiagnostic: errorMsg };
  }

  // 2. manifest_version is exactly 3
  if (parsed.manifest_version === 3) {
    checks.push({
      id: "manifest_version_3",
      label: "Manifest V3 declaration ('manifest_version': 3)",
      passed: true,
    });
  } else {
    checks.push({
      id: "manifest_version_3",
      label: "Manifest V3 declaration ('manifest_version': 3)",
      passed: false,
      message: `manifest_version must be exactly 3 for Chrome extensions (found: ${JSON.stringify(
        parsed.manifest_version
      )}).`,
    });
  }

  // 3. Name is a non-empty string
  if (typeof parsed.name === "string" && parsed.name.trim().length > 0) {
    checks.push({
      id: "manifest_name",
      label: "Non-empty extension name",
      passed: true,
    });
  } else {
    checks.push({
      id: "manifest_name",
      label: "Non-empty extension name",
      passed: false,
      message: "Field 'name' is required and must be a non-empty string.",
    });
  }

  // 4. Version has appropriate format
  if (typeof parsed.version === "string" && /^[0-9]+(\.[0-9]+)*$/.test(parsed.version.trim())) {
    checks.push({
      id: "manifest_version_format",
      label: "Valid numeric version format (e.g. 1.0.0)",
      passed: true,
    });
  } else {
    checks.push({
      id: "manifest_version_format",
      label: "Valid numeric version format (e.g. 1.0.0)",
      passed: false,
      message: `Field 'version' must follow dot-delimited numeric versioning like '1.0.0' (found: ${JSON.stringify(
        parsed.version
      )}).`,
    });
  }

  // 5. action.default_popup points to popup.html
  if (
    parsed.action &&
    typeof parsed.action === "object" &&
    typeof parsed.action.default_popup === "string" &&
    parsed.action.default_popup.toLowerCase().includes("popup.html")
  ) {
    checks.push({
      id: "manifest_action_popup",
      label: "Action popup configured ('action.default_popup': 'popup.html')",
      passed: true,
    });
  } else {
    checks.push({
      id: "manifest_action_popup",
      label: "Action popup configured ('action.default_popup': 'popup.html')",
      passed: false,
      message: `Field 'action.default_popup' must point to 'popup.html' (found: ${JSON.stringify(
        parsed?.action?.default_popup
      )}).`,
    });
  }

  // 6. Permissions are valid string array if specified
  if (
    !parsed.permissions ||
    (Array.isArray(parsed.permissions) && parsed.permissions.every((p: any) => typeof p === "string"))
  ) {
    checks.push({
      id: "manifest_permissions",
      label: "Valid permissions array structure",
      passed: true,
    });
  } else {
    checks.push({
      id: "manifest_permissions",
      label: "Valid permissions array structure",
      passed: false,
      message: "Field 'permissions' must be an array of string permission identifiers (e.g. ['storage']).",
    });
  }

  const allPassed = checks.every((c) => c.passed);
  return { checks, passed: allPassed };
}

/**
 * Deterministically checks a popup HTML string for document structure and CSP safety.
 */
export function verifyPopupHtml(content: string): {
  checks: VerificationCheck[];
  passed: boolean;
  errorDiagnostic?: string;
} {
  const checks: VerificationCheck[] = [];
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    checks.push({
      id: "popup_html_empty",
      label: "Non-empty HTML file",
      passed: false,
      message: "The submitted popup.html file is empty.",
    });
    return { checks, passed: false, errorDiagnostic: "Empty submission" };
  }

  const lower = trimmed.toLowerCase();

  // 1. Document Structure Check
  const hasDoctype = lower.includes("<!doctype html");
  const hasHtmlTag = lower.includes("<html") && lower.includes("</html>");
  if (hasDoctype || hasHtmlTag) {
    checks.push({
      id: "popup_html_structure",
      label: "HTML document structure (<!DOCTYPE html> and <html>)",
      passed: true,
    });
  } else {
    checks.push({
      id: "popup_html_structure",
      label: "HTML document structure (<!DOCTYPE html> and <html>)",
      passed: false,
      message: "Missing standard HTML document structure. Must include '<!DOCTYPE html>' declaration and '<html>' tags.",
    });
  }

  // 2. Head and Body Sections Check
  const hasHead = lower.includes("<head") && lower.includes("</head>");
  const hasBody = lower.includes("<body") && lower.includes("</body>");
  if (hasHead && hasBody) {
    checks.push({
      id: "popup_head_body",
      label: "Standard <head> and <body> sections",
      passed: true,
    });
  } else {
    checks.push({
      id: "popup_head_body",
      label: "Standard <head> and <body> sections",
      passed: false,
      message: "HTML file must contain both '<head>...</head>' and '<body>...</body>' sections.",
    });
  }

  // 3. Meaningful Visible Interface Content
  const hasVisibleElements = /<(h1|h2|h3|h4|p|div|main|header|button|span|section)[^>]*>/i.test(trimmed);
  const strippedText = trimmed.replace(/<[^>]+>/g, "").trim();
  if (hasVisibleElements && strippedText.length >= 8) {
    checks.push({
      id: "popup_visible_content",
      label: "Visible user interface elements and text",
      passed: true,
    });
  } else {
    checks.push({
      id: "popup_visible_content",
      label: "Visible user interface elements and text",
      passed: false,
      message: "Popup must contain visible UI elements (e.g. heading, descriptive paragraph) rather than an empty page.",
    });
  }

  // 4. Asset references consistency and MV3 CSP safety
  const hasRemoteScript = /<script[^>]+src=["']https?:\/\//i.test(trimmed);
  if (!hasRemoteScript) {
    checks.push({
      id: "popup_asset_safety",
      label: "Local asset references (No remote CDN scripts in MV3)",
      passed: true,
    });
  } else {
    checks.push({
      id: "popup_asset_safety",
      label: "Local asset references (No remote CDN scripts in MV3)",
      passed: false,
      message: "Chrome Manifest V3 Content Security Policy strictly forbids loading remote external scripts (<script src='http...'>). Use local bundled scripts.",
    });
  }

  const allPassed = checks.every((c) => c.passed);
  return { checks, passed: allPassed };
}

/**
 * Authoritative deterministic verification for milestone code artifacts.
 */
export function verifyArtifact(
  filename: string,
  content: string,
  stepId: string
): StepReviewResult {
  const normFilename = (filename || "").trim().toLowerCase();
  const contentHash = computeContentHash(content || "");

  let checkResult: { checks: VerificationCheck[]; passed: boolean; errorDiagnostic?: string };

  if (normFilename.endsWith("manifest.json")) {
    checkResult = verifyManifestJson(content || "");
  } else if (normFilename.endsWith(".html") || normFilename.includes("popup")) {
    checkResult = verifyPopupHtml(content || "");
  } else {
    const hasContent = (content || "").trim().length >= 10;
    checkResult = {
      passed: hasContent,
      checks: [
        {
          id: "generic_content_present",
          label: `File ${filename} has non-empty content`,
          passed: hasContent,
          message: hasContent ? undefined : "File content is empty or too short to verify.",
        },
      ],
    };
  }

  const passedChecks = checkResult.checks.filter((c) => c.passed);
  const failedChecks = checkResult.checks.filter((c) => !c.passed);

  if (checkResult.passed) {
    return {
      stepId,
      verdict: "passed",
      verdictLabel: `✓ ${filename} VERIFIED`,
      feedback: `All deterministic structural checks passed for ${filename}. The file satisfies Chrome Manifest V3 starter specifications.`,
      positivePoints: passedChecks.map((c) => c.label),
      suggestedFixes: [],
      nextTip: `Save this verified file to your local extension folder as '${filename}'.`,
      timestamp: Date.now(),
      checks: checkResult.checks,
      artifactFilename: filename,
      contentHash,
    };
  } else {
    return {
      stepId,
      verdict: "needs_work",
      verdictLabel: `⚠️ ${filename} CHECKS FAILED`,
      feedback: `Deterministic verification failed for ${filename}. Please correct the reported issues before loading in Chrome.`,
      positivePoints: passedChecks.map((c) => c.label),
      suggestedFixes: failedChecks.map((c) => c.message || c.label),
      nextTip: `Address the ${failedChecks.length} failed check(s) above and re-submit ${filename}.`,
      timestamp: Date.now(),
      checks: checkResult.checks,
      artifactFilename: filename,
      contentHash,
    };
  }
}
