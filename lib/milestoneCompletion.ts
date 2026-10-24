import { RoadmapNode, StepReviewResult } from "@/types/blueprint";

/**
 * Standard pure-JavaScript implementation of FIPS 180-2 SHA-256.
 * Operates synchronously anywhere (browser, Node, Edge runtime) with zero external packages.
 */
function sha256Sync(str: string): string {
  const bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(str)
      : Buffer.from(str, "utf8");

  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  let H0 = 0x6a09e667;
  let H1 = 0xbb67ae85;
  let H2 = 0x3c6ef372;
  let H3 = 0xa54ff53a;
  let H4 = 0x510e527f;
  let H5 = 0x9b05688c;
  let H6 = 0x1f83d9ab;
  let H7 = 0x5be0cd19;

  const len = bytes.length;
  const bitLenHi = Math.floor(len / 0x20000000);
  const bitLenLo = (len * 8) >>> 0;

  const totalLen = (len + 9 + 63) & ~63;
  const block = new Uint8Array(totalLen);
  block.set(bytes);
  block[len] = 0x80;

  const view = new DataView(block.buffer);
  view.setUint32(totalLen - 8, bitLenHi, false);
  view.setUint32(totalLen - 4, bitLenLo, false);

  const W = new Uint32Array(64);

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 =
        ((W[i - 15] >>> 7) | (W[i - 15] << 25)) ^
        ((W[i - 15] >>> 18) | (W[i - 15] << 14)) ^
        (W[i - 15] >>> 3);
      const s1 =
        ((W[i - 2] >>> 17) | (W[i - 2] << 15)) ^
        ((W[i - 2] >>> 19) | (W[i - 2] << 13)) ^
        (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let a = H0,
      b = H1,
      c = H2,
      d = H3,
      e = H4,
      f = H5,
      g = H6,
      h = H7;

    for (let i = 0; i < 64; i++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H0 = (H0 + a) >>> 0;
    H1 = (H1 + b) >>> 0;
    H2 = (H2 + c) >>> 0;
    H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0;
    H5 = (H5 + f) >>> 0;
    H6 = (H6 + g) >>> 0;
    H7 = (H7 + h) >>> 0;
  }

  const out = new DataView(new ArrayBuffer(32));
  out.setUint32(0, H0, false);
  out.setUint32(4, H1, false);
  out.setUint32(8, H2, false);
  out.setUint32(12, H3, false);
  out.setUint32(16, H4, false);
  out.setUint32(20, H5, false);
  out.setUint32(24, H6, false);
  out.setUint32(28, H7, false);

  let hex = "";
  const u8 = new Uint8Array(out.buffer);
  for (let i = 0; i < 32; i++) {
    hex += u8[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Browser-compatible pure JavaScript implementation of FIPS 180-2 SHA-256.
 * Operates without Node.js `crypto` or any external package.
 */
export function computeContentHashBrowser(content: string): string {
  if (typeof content !== "string") {
    content = "";
  }
  return sha256Sync(content);
}

/**
 * Computes the exact 64-character SHA-256 hex digest of the raw UTF-8 content.
 * Does NOT silently trim leading or trailing whitespace.
 * Uses native Node.js crypto on the server when available, or pure JS in the browser.
 */
export function computeContentHash(content: string): string {
  if (typeof content !== "string") {
    content = "";
  }
  if (typeof window === "undefined") {
    try {
      const nodeCrypto = typeof require === "function" ? require("crypto") : null;
      if (nodeCrypto && typeof nodeCrypto.createHash === "function") {
        return nodeCrypto.createHash("sha256").update(content, "utf8").digest("hex");
      }
    } catch {
      // Fall through to browser-compatible pure JS implementation
    }
  }

  return computeContentHashBrowser(content);
}

export interface CompletionEligibilityResult {
  allowed: boolean;
  reason?: string;
  unverifiedArtifacts: string[];
  allArtifactsPassed: boolean;
}

/**
 * Centralized completion-eligibility function.
 * Enforces that any milestone with starter artifacts must have every required artifact
 * verified with a full 64-character SHA-256 digest matching its exact current content.
 */
export function isMilestoneCompletionAllowed(
  node: RoadmapNode,
  artifactReviews: Record<string, StepReviewResult> = {},
  currentArtifactContents: Record<string, string> = {}
): CompletionEligibilityResult {
  if (!node) {
    return {
      allowed: true,
      allArtifactsPassed: true,
      unverifiedArtifacts: [],
    };
  }

  const artifacts = node.starterArtifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    // Unrelated milestone without starter artifacts: manual completion is preserved
    return {
      allowed: true,
      allArtifactsPassed: true,
      unverifiedArtifacts: [],
    };
  }

  const unverified: string[] = [];

  for (const art of artifacts) {
    const filename = art.filename;
    const key = `${node.id}::${filename}`;
    const review = artifactReviews[key];
    const currentText =
      currentArtifactContents[key] !== undefined
        ? currentArtifactContents[key]
        : art.content;
    const currentHash = computeContentHash(currentText);

    // Exact content verification check:
    // 1. Must have review
    // 2. Verdict must be "passed"
    // 3. Must be a full 64-char SHA-256 fingerprint (legacy truncated 16-char hashes require re-verification)
    // 4. Must exactly match the current content's hash (no whitespace trimming)
    const isPassing = Boolean(
      review &&
        review.verdict === "passed" &&
        typeof review.contentHash === "string" &&
        review.contentHash.length === 64 &&
        review.contentHash === currentHash
    );

    if (!isPassing) {
      unverified.push(filename);
    }
  }

  if (unverified.length === 0) {
    return {
      allowed: true,
      allArtifactsPassed: true,
      unverifiedArtifacts: [],
    };
  }

  const reason = `All required starter files (${artifacts
    .map((a) => a.filename)
    .join(", ")}) must pass deterministic verification before Step 0${
    node.step
  } can be marked complete. Pending or modified: ${unverified.join(", ")}.`;

  return {
    allowed: false,
    allArtifactsPassed: false,
    unverifiedArtifacts: unverified,
    reason,
  };
}

/**
 * Sanitizes a list of completed milestone IDs (e.g. restored from localStorage)
 * by verifying that every milestone with starter artifacts actually meets the completion gate.
 */
export function sanitizeCompletedNodeIds(
  completedNodeIds: string[],
  nodes: RoadmapNode[],
  artifactReviews: Record<string, StepReviewResult> = {},
  currentArtifactContents: Record<string, string> = {}
): string[] {
  if (!Array.isArray(completedNodeIds) || completedNodeIds.length === 0) {
    return [];
  }
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return completedNodeIds;
  }

  return completedNodeIds.filter((id) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return true; // Keep unknown nodes if any
    const eligibility = isMilestoneCompletionAllowed(
      node,
      artifactReviews,
      currentArtifactContents
    );
    return eligibility.allowed;
  });
}
