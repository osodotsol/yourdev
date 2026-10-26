"use client";

import React, { useState, useEffect } from "react";
import { RoadmapNode, StepReviewResult, StarterArtifact, VerificationCheck } from "@/types/blueprint";
import {
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  Code2,
  FileCode,
  Sparkles,
  ArrowDown,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Loader2,
  RotateCcw,
  ShieldCheck,
  FolderGit2,
  Info,
} from "lucide-react";
import { saveSession, loadSession } from "@/lib/persistence";
import {
  computeContentHash,
  isMilestoneCompletionAllowed,
} from "@/lib/milestoneCompletion";
import { MarkdownContent, InlineMarkdown } from "@/components/MarkdownRenderer";

interface RoadmapGraphProps {
  nodes: RoadmapNode[];
  ideaText?: string;
  completedNodeIds?: string[];
  onToggleNode?: (nodeId: string) => void;
  savedReviews?: Record<string, StepReviewResult>;
  onSaveReview?: (stepId: string, review: StepReviewResult) => void;
  savedArtifactReviews?: Record<string, StepReviewResult>;
  onSaveArtifactReview?: (key: string, review: StepReviewResult) => void;
  savedArtifactDrafts?: Record<string, string>;
  onSaveArtifactDraft?: (key: string, content: string) => void;
  onShowToast: (msg: string) => void;
}

export function RoadmapGraph({
  nodes,
  ideaText = "",
  completedNodeIds: externalCompletedNodeIds,
  onToggleNode,
  savedReviews = {},
  onSaveReview,
  savedArtifactReviews = {},
  onSaveArtifactReview,
  savedArtifactDrafts = {},
  onSaveArtifactDraft,
  onShowToast,
}: RoadmapGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id || "node-1"
  );
  const [internalCompletedNodeIds, setInternalCompletedNodeIds] = useState<string[]>([]);
  const [localReviews, setLocalReviews] = useState<Record<string, StepReviewResult>>(savedReviews);
  const [localArtifactReviews, setLocalArtifactReviews] = useState<Record<string, StepReviewResult>>(() => {
    if (savedArtifactReviews && Object.keys(savedArtifactReviews).length > 0) {
      return savedArtifactReviews;
    }
    const session = loadSession();
    return session.artifactReviews || {};
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const starterArtifacts = selectedNode?.starterArtifacts || [];
  const hasStarterArtifacts = starterArtifacts.length > 0;

  const [inspectorMode, setInspectorMode] = useState<"artifacts" | "prompt" | "review">(() =>
    hasStarterArtifacts ? "artifacts" : "prompt"
  );
  const [selectedArtifactIndex, setSelectedArtifactIndex] = useState(0);
  const [activeReviewFilename, setActiveReviewFilename] = useState<string>("");
  const [artifactSubmissions, setArtifactSubmissions] = useState<Record<string, string>>(() => {
    if (savedArtifactDrafts && Object.keys(savedArtifactDrafts).length > 0) {
      return savedArtifactDrafts;
    }
    const session = loadSession();
    return session.artifactDrafts || {};
  });
  const [isVerifyingArtifact, setIsVerifyingArtifact] = useState(false);
  const [verificationSubMode, setVerificationSubMode] = useState<"artifact" | "mentor">("artifact");

  // Freeform mentor review state
  const [submissionText, setSubmissionText] = useState("");
  const [submissionType, setSubmissionType] = useState<"code" | "summary" | "question">("code");
  const [isReviewing, setIsReviewing] = useState(false);

  const completedNodeIds = externalCompletedNodeIds || internalCompletedNodeIds;
  const currentMentorReview = localReviews[selectedNode.id];

  // Helper key for per-artifact reviews
  const getArtifactKey = (nodeId: string, filename: string) => `${nodeId}::${filename}`;

  // Current artifact in "artifacts" tab
  const activeStarterArtifact =
    starterArtifacts[selectedArtifactIndex] || starterArtifacts[0];

  // Current artifact under verification in "review" tab
  const currentVerifyFilename =
    activeReviewFilename || activeStarterArtifact?.filename || (hasStarterArtifacts ? starterArtifacts[0].filename : "");
  const currentVerifyKey = getArtifactKey(selectedNode.id, currentVerifyFilename);

  const currentVerifyArtifact = starterArtifacts.find((a) => a.filename === currentVerifyFilename);

  const currentArtifactSubmission =
    artifactSubmissions[currentVerifyKey] !== undefined
      ? artifactSubmissions[currentVerifyKey]
      : (currentVerifyArtifact?.content || "");

  const currentArtifactReview = localArtifactReviews[currentVerifyKey];
  const currentArtifactHash = computeContentHash(currentArtifactSubmission);

  // Check if current editor content differs from the text that was verified
  const isContentModified = Boolean(
    currentArtifactReview &&
    currentArtifactReview.verdict === "passed" &&
    (typeof currentArtifactReview.contentHash !== "string" ||
      currentArtifactReview.contentHash.length !== 64 ||
      currentArtifactReview.contentHash !== currentArtifactHash)
  );

  // Compute status summary for all artifacts belonging to selectedNode
  const artifactCheckSummaries = starterArtifacts.map((art) => {
    const key = getArtifactKey(selectedNode.id, art.filename);
    const rev = localArtifactReviews[key];
    const userContent =
      artifactSubmissions[key] !== undefined ? artifactSubmissions[key] : art.content;
    const userHash = computeContentHash(userContent);
    const passed = Boolean(
      rev &&
      rev.verdict === "passed" &&
      typeof rev.contentHash === "string" &&
      rev.contentHash.length === 64 &&
      rev.contentHash === userHash
    );
    const modified = Boolean(
      rev &&
      rev.verdict === "passed" &&
      (typeof rev.contentHash !== "string" ||
        rev.contentHash.length !== 64 ||
        rev.contentHash !== userHash)
    );
    return {
      filename: art.filename,
      passed,
      modified,
      review: rev,
    };
  });

  const allArtifactsPassed =
    hasStarterArtifacts && artifactCheckSummaries.every((s) => s.passed);
  const passedArtifactCount = artifactCheckSummaries.filter((s) => s.passed).length;

  const toggleNodeCompletion = (e: React.MouseEvent | null, id: string, force?: boolean) => {
    if (e) e.stopPropagation();
    const isCurrentlyCompleted = completedNodeIds.includes(id);
    const targetState = force !== undefined ? force : !isCurrentlyCompleted;

    if (targetState === isCurrentlyCompleted) {
      return;
    }

    if (targetState === true) {
      const targetNode = nodes.find((n) => n.id === id);
      if (targetNode) {
        const eligibility = isMilestoneCompletionAllowed(
          targetNode,
          localArtifactReviews,
          artifactSubmissions
        );
        if (!eligibility.allowed) {
          onShowToast(
            `⚠️ CANNOT COMPLETE MILESTONE: ${eligibility.reason || "All starter artifacts must pass verification."}`
          );
          return;
        }
      }
    }

    if (onToggleNode) {
      onToggleNode(id);
    } else {
      setInternalCompletedNodeIds((prev) =>
        targetState ? [...prev, id] : prev.filter((i) => i !== id)
      );
    }
  };

  const handleArtifactContentChange = (filename: string, newContent: string) => {
    const key = getArtifactKey(selectedNode.id, filename);
    const updatedSubmissions = { ...artifactSubmissions, [key]: newContent };
    setArtifactSubmissions(updatedSubmissions);
    saveSession({ artifactDrafts: updatedSubmissions });
    if (onSaveArtifactDraft) {
      onSaveArtifactDraft(key, newContent);
    }

    if (completedNodeIds.includes(selectedNode.id)) {
      const eligibility = isMilestoneCompletionAllowed(
        selectedNode,
        localArtifactReviews,
        updatedSubmissions
      );
      if (!eligibility.allowed) {
        if (onToggleNode) {
          onToggleNode(selectedNode.id);
        } else {
          setInternalCompletedNodeIds((prev) => prev.filter((i) => i !== selectedNode.id));
        }
        onShowToast(
          `⚠️ Step 0${selectedNode.step} marked uncompleted: ${filename} was modified and requires re-verification.`
        );
      }
    }
  };

  const handleCopyStepPrompt = async (prompt: string, stepTitle: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      onShowToast(`✓ PROMPT FOR STEP COPIED TO CLIPBOARD`);
    } catch {
      onShowToast("Failed to copy prompt.");
    }
  };

  const handleCopyArtifact = async (artifact: StarterArtifact) => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      onShowToast(`✓ ./${artifact.filename} copied to clipboard`);
    } catch {
      onShowToast(`Failed to copy ./${artifact.filename}`);
    }
  };

  const handleVerifyArtifact = async (filenameToVerify: string) => {
    const key = getArtifactKey(selectedNode.id, filenameToVerify);
    const textToVerify =
      artifactSubmissions[key] !== undefined
        ? artifactSubmissions[key]
        : (starterArtifacts.find((a) => a.filename === filenameToVerify)?.content || "");

    setIsVerifyingArtifact(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaText,
          milestone: selectedNode,
          submission: textToVerify,
          submissionType: "artifact",
          filename: filenameToVerify,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify artifact.");
      }

      const data = await res.json();
      if (data.review) {
        const review: StepReviewResult = data.review;
        const updated = { ...localArtifactReviews, [key]: review };
        setLocalArtifactReviews(updated);
        saveSession({ artifactReviews: updated });
        if (onSaveArtifactReview) {
          onSaveArtifactReview(key, review);
        }

        if (review.verdict === "passed") {
          const eligibility = isMilestoneCompletionAllowed(
            selectedNode,
            updated,
            artifactSubmissions
          );

          if (eligibility.allowed) {
            onShowToast(`✓ ALL ${starterArtifacts.length} ARTIFACTS VERIFIED — MILESTONE COMPLETE!`);
            if (!completedNodeIds.includes(selectedNode.id)) {
              toggleNodeCompletion(null, selectedNode.id, true);
            }
          } else {
            const passedCount = starterArtifacts.length - eligibility.unverifiedArtifacts.length;
            onShowToast(
              `✓ ${filenameToVerify} VERIFIED (${passedCount}/${starterArtifacts.length} files passed). Pending: ${eligibility.unverifiedArtifacts.join(", ")}.`
            );
          }
        } else {
          onShowToast(`⚠️ ${filenameToVerify} CHECKS FAILED — See itemized feedback below.`);
          // If milestone was previously completed, but now has a failing artifact, unmark it
          if (completedNodeIds.includes(selectedNode.id)) {
            toggleNodeCompletion(null, selectedNode.id, false);
          }
        }
      }
    } catch (err: any) {
      console.error("[Artifact Verification]", err);
      onShowToast("Failed to verify artifact. Please try again.");
    } finally {
      setIsVerifyingArtifact(false);
    }
  };

  const handleRunMentorReview = async () => {
    if (!submissionText.trim() || submissionText.trim().length < 5) {
      onShowToast("Please paste your code or notes (at least 5 characters).");
      return;
    }

    setIsReviewing(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaText,
          milestone: selectedNode,
          submission: submissionText,
          submissionType,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to evaluate step submission.");
      }

      const data = await res.json();
      if (data.review) {
        const review: StepReviewResult = data.review;
        const updated = { ...localReviews, [selectedNode.id]: review };
        setLocalReviews(updated);
        if (onSaveReview) {
          onSaveReview(selectedNode.id, review);
        }

        if (review.verdict === "passed") {
          onShowToast("✓ STEP VERIFIED BY MENTOR");
          const eligibility = isMilestoneCompletionAllowed(
            selectedNode,
            localArtifactReviews,
            artifactSubmissions
          );
          if (eligibility.allowed) {
            if (!completedNodeIds.includes(selectedNode.id)) {
              toggleNodeCompletion(null, selectedNode.id, true);
            }
          } else {
            onShowToast(
              `⚠️ Mentor review passed, but Step 0${selectedNode.step} has unverified starter files: ${eligibility.unverifiedArtifacts.join(", ")}. Verify all required artifacts to mark complete.`
            );
          }
        } else {
          onShowToast("⚠️ MENTOR FEEDBACK READY");
        }
      }
    } catch (err: any) {
      console.error("[Mentor Review]", err);
      onShowToast("Failed to review step. Try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const progressPercent = Math.round(
    (completedNodeIds.length / (nodes.length || 1)) * 100
  );

  return (
    <div className="roadmap-studio-wrap">
      {/* Visual Roadmap Header */}
      <div className="roadmap-studio-head">
        <div>
          <div className="card-kicker">
            Milestone Execution & Verification Studio
          </div>
          <h3 className="roadmap-studio-title">
            Visual Execution Tree & Verification Queue
          </h3>
          <p className="roadmap-studio-desc">
            Select any milestone node to inspect starter files, copy single-slice prompts,
            run deterministic artifact verification, or submit code for mentor review.
          </p>
        </div>

        {/* Progress Tracker Pill */}
        <div className="roadmap-progress-box">
          <div className="roadmap-progress-label">
            <span>MILESTONE PROGRESS</span>
            <strong>
              {completedNodeIds.length}/{nodes.length} Completed ({progressPercent}%)
            </strong>
          </div>
          <div className="roadmap-progress-bar">
            <div
              className="roadmap-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-Column Studio Layout: Visual Flowchart on Left, Drilldown Inspector on Right */}
      <div className="roadmap-studio-grid">
        {/* Left Column: Visual Flowchart Nodes */}
        <div className="roadmap-flow-column">
          {nodes.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;
            const isCompleted = completedNodeIds.includes(node.id);
            const isLast = index === nodes.length - 1;
            const hasReview = Boolean(localReviews[node.id]);
            const nodeArtifacts = node.starterArtifacts || [];
            const hasNodeArtifacts = nodeArtifacts.length > 0;

            const allNodeArtifactsPassed =
              hasNodeArtifacts &&
              nodeArtifacts.every((art) => {
                const k = getArtifactKey(node.id, art.filename);
                const r = localArtifactReviews[k];
                return r && r.verdict === "passed";
              });

            return (
              <React.Fragment key={node.id}>
                <div
                  className={`roadmap-node-card ${
                    isSelected ? "is-active" : ""
                  } ${isCompleted ? "is-completed" : ""}`}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    setSelectedArtifactIndex(0);
                    if (node.starterArtifacts && node.starterArtifacts.length > 0) {
                      setActiveReviewFilename(node.starterArtifacts[0].filename);
                    }
                  }}
                >
                  <div className="roadmap-node-top">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        type="button"
                        aria-label="Toggle node completed"
                        className={`roadmap-checkbox ${
                          isCompleted ? "is-checked" : ""
                        }`}
                        onClick={(e) => toggleNodeCompletion(e, node.id)}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <span className="roadmap-step-pill">0{node.step}</span>

                      <span
                        className={`roadmap-badge-tag ${
                          node.badge === "CORE MVP"
                            ? "tag-core"
                            : node.badge === "RECOMMENDED"
                            ? "tag-rec"
                            : "tag-polish"
                        }`}
                      >
                        {node.badge}
                      </span>

                      {hasNodeArtifacts && (
                        <span
                          style={{
                            fontSize: "9.5px",
                            fontFamily: "var(--mono)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: allNodeArtifactsPassed ? "#ecfdf5" : "#eff6ff",
                            color: allNodeArtifactsPassed ? "#065f46" : "#1d4ed8",
                            border: `1px solid ${allNodeArtifactsPassed ? "#a7f3d0" : "#bfdbfe"}`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <FileCode className="w-2.5 h-2.5" />
                          <span>Starter Files ({nodeArtifacts.length})</span>
                        </span>
                      )}

                      {hasReview && !hasNodeArtifacts && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontFamily: "var(--mono)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: localReviews[node.id].verdict === "passed" ? "#ecfdf5" : "#fffbeb",
                            color: localReviews[node.id].verdict === "passed" ? "#065f46" : "#b45309",
                            border: `1px solid ${localReviews[node.id].verdict === "passed" ? "#a7f3d0" : "#fde68a"}`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <GraduationCap className="w-2.5 h-2.5" />
                          <span>Reviewed</span>
                        </span>
                      )}
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? "rotate-90 text-slate-900" : "text-slate-400"
                      }`}
                    />
                  </div>

                  <div className="roadmap-node-title">{node.title}</div>
                  <div className="roadmap-node-sub">{node.subtitle}</div>

                  {/* Files badges */}
                  <div className="roadmap-files-preview">
                    {node.filesToCreate.slice(0, 2).map((file, i) => (
                      <span key={i} className="roadmap-file-pill">
                        <FileCode className="w-3 h-3 text-slate-500" />
                        <span>{file}</span>
                      </span>
                    ))}
                    {node.filesToCreate.length > 2 && (
                      <span className="roadmap-file-pill">
                        +{node.filesToCreate.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <div className="roadmap-node-connector">
                    <div className="connector-line" />
                    <ArrowDown className="w-3.5 h-3.5 connector-arrow" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Column: Node Inspector & Starter Artifacts / Mentor Drawer */}
        {selectedNode && (
          <div className="roadmap-inspector-card">
            <div className="inspector-head">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="inspector-step-badge">
                  STEP 0{selectedNode.step} OF 0{nodes.length}
                </span>
                <span style={{ color: "var(--border-strong)", fontSize: "14px" }}>•</span>
                <span
                  className={`roadmap-badge-tag ${
                    selectedNode.badge === "CORE MVP"
                      ? "tag-core"
                      : selectedNode.badge === "RECOMMENDED"
                      ? "tag-rec"
                      : "tag-polish"
                  }`}
                >
                  {selectedNode.badge}
                </span>
              </div>

              <button
                type="button"
                className="btn-craft-secondary"
                style={{ padding: "6px 12px", fontSize: "11px" }}
                onClick={(e) => toggleNodeCompletion(e, selectedNode.id)}
              >
                {completedNodeIds.includes(selectedNode.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>Completed</span>
                  </>
                ) : (
                  <span>Mark as Done</span>
                )}
              </button>
            </div>

            <h4 className="inspector-title">{selectedNode.title}</h4>
            <p className="inspector-subtitle">{selectedNode.subtitle}</p>

            <div className="inspector-section">
              <div className="inspector-sec-label">Milestone Objective:</div>
              <p className="inspector-goal">
                <InlineMarkdown text={selectedNode.goal} />
              </p>
            </div>

            {/* Concept to Learn & Time Budget */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px", marginBottom: "12px" }}>
              {selectedNode.conceptToLearn && (
                <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "10.5px", fontFamily: "var(--mono)", color: "var(--text-soft)", textTransform: "uppercase", marginBottom: "4px", fontWeight: 700, letterSpacing: "0.06em" }}>
                    Core Architectural Concept
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text)", lineHeight: "1.45" }}>
                    <InlineMarkdown text={selectedNode.conceptToLearn} />
                  </div>
                </div>
              )}
              <div style={{ background: "#ffffff", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10.5px", fontFamily: "var(--mono)", color: "var(--text-soft)", textTransform: "uppercase", marginBottom: "4px", fontWeight: 700, letterSpacing: "0.06em" }}>
                  Estimated Time Allocation
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>
                  {Math.min(selectedNode.estimatedMinutes || 60, 90)} minutes (Capped size)
                </div>
              </div>
            </div>

            {/* Definition of Done */}
            {selectedNode.definitionOfDone && (
              <div className="inspector-section" style={{ background: "#ffffff", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-strong)" }}>
                <div className="inspector-sec-label" style={{ color: "#0f172a", marginBottom: "6px" }}>
                  Definition of Done Checklist
                </div>
                {Array.isArray(selectedNode.definitionOfDone) ? (
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "var(--text)", lineHeight: "1.55" }}>
                    {selectedNode.definitionOfDone.map((item, idx) => (
                      <li key={idx}>
                        <InlineMarkdown text={item} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: "12.5px", margin: 0, color: "var(--text)", lineHeight: "1.55" }}>
                    <InlineMarkdown text={selectedNode.definitionOfDone} />
                  </div>
                )}
              </div>
            )}

            {/* Target Files */}
            <div className="inspector-section">
              <div className="inspector-sec-label">Target Files (Max 3 per milestone):</div>
              <div className="inspector-files-grid">
                {selectedNode.filesToCreate.slice(0, 3).map((f, i) => (
                  <div key={i} className="inspector-file-row">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    <code>{f}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Documentation Links for this step */}
            {selectedNode.resources && selectedNode.resources.length > 0 && (
              <div className="inspector-section">
                <div className="inspector-sec-label">Official Docs (Curated Resources):</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedNode.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inspector-doc-link"
                    >
                      <span>{res.title}</span>
                      <span style={{ fontSize: "9px", fontFamily: "var(--mono)", padding: "1px 5px", borderRadius: "3px", background: "#f1f5f9", color: "#64748b" }}>
                        official docs
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Inspector Tab Switcher */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginTop: "18px",
                padding: "4px",
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
              }}
            >
              {hasStarterArtifacts && (
                <button
                  type="button"
                  onClick={() => setInspectorMode("artifacts")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: inspectorMode === "artifacts" ? "#ffffff" : "transparent",
                    color: inspectorMode === "artifacts" ? "var(--text)" : "var(--text-muted)",
                    boxShadow: inspectorMode === "artifacts" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Starter Files ({starterArtifacts.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setInspectorMode("review")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: inspectorMode === "review" ? "#ffffff" : "transparent",
                  color: inspectorMode === "review" ? "var(--text)" : "var(--text-muted)",
                  boxShadow: inspectorMode === "review" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Build & Verify</span>
                {hasStarterArtifacts ? (
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      background: allArtifactsPassed ? "#ecfdf5" : "#f1f5f9",
                      color: allArtifactsPassed ? "#047857" : "#64748b",
                      fontWeight: 700,
                    }}
                  >
                    {passedArtifactCount}/{starterArtifacts.length}
                  </span>
                ) : currentMentorReview ? (
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: currentMentorReview.verdict === "passed" ? "#10b981" : "#f59e0b",
                    }}
                  />
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setInspectorMode("prompt")}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: inspectorMode === "prompt" ? "#ffffff" : "transparent",
                  color: inspectorMode === "prompt" ? "var(--text)" : "var(--text-muted)",
                  boxShadow: inspectorMode === "prompt" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Agent Prompt</span>
              </button>
            </div>

            {/* TAB 1: Starter Code Artifacts (Task 6) */}
            {inspectorMode === "artifacts" && hasStarterArtifacts && (
              <div style={{ marginTop: "16px" }}>
                {/* File Tabs */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                  {starterArtifacts.map((art, idx) => {
                    const isTabActive = idx === selectedArtifactIndex;
                    const artKey = getArtifactKey(selectedNode.id, art.filename);
                    const rev = localArtifactReviews[artKey];
                    const isPassed = rev && rev.verdict === "passed";

                    return (
                      <button
                        key={art.filename}
                        type="button"
                        onClick={() => {
                          setSelectedArtifactIndex(idx);
                          setActiveReviewFilename(art.filename);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: `1px solid ${isTabActive ? "var(--border-strong)" : "var(--border)"}`,
                          background: isTabActive ? "#1e293b" : "#ffffff",
                          color: isTabActive ? "#ffffff" : "#475569",
                          fontSize: "12px",
                          fontFamily: "var(--mono)",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>./{art.filename}</span>
                        {isPassed && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected File Card */}
                {activeStarterArtifact && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid var(--border)",
                      borderRadius: "10px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            ./{activeStarterArtifact.filename}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--mono)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "#f1f5f9",
                              color: "#64748b",
                            }}
                          >
                            Root Folder
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                          {activeStarterArtifact.purpose}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn-craft-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          background: "#0f172a",
                          color: "#ffffff",
                          borderColor: "#334155",
                        }}
                        onClick={() => handleCopyArtifact(activeStarterArtifact)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ./{activeStarterArtifact.filename}</span>
                      </button>
                    </div>

                    {/* Beginner Working Shell Callout */}
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--border)",
                        borderLeft: "3px solid #0f172a",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        fontSize: "12.5px",
                        lineHeight: "1.55",
                        color: "var(--text)",
                        marginBottom: "14px",
                      }}
                    >
                      <strong style={{ color: "#0f172a" }}>Initial Working Shell:</strong> This file provides the minimal Manifest V3
                      skeleton required to load successfully in Chrome via <code>chrome://extensions</code> (&ldquo;Load unpacked&rdquo;).
                      It establishes a functional foundation without premature background processing or persistent storage.
                      <div style={{ marginTop: "6px", color: "var(--text-muted)", fontSize: "11.5px" }}>
                        <strong style={{ color: "#0f172a" }}>Subsequent Scope:</strong> Milestone 02 connects local storage or background scripts.
                      </div>
                    </div>

                    {/* Preformatted Code Content */}
                    <div className="inspector-prompt-block" style={{ marginTop: "8px" }}>
                      <pre
                        className="inspector-prompt-pre"
                        style={{ maxHeight: "300px", overflowY: "auto", fontSize: "11.5px" }}
                      >
                        <code>{activeStarterArtifact.content}</code>
                      </pre>
                    </div>

                    {/* Quick Link to Verification */}
                    <div style={{ marginTop: "12px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReviewFilename(activeStarterArtifact.filename);
                          setVerificationSubMode("artifact");
                          setInspectorMode("review");
                        }}
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: "#2563eb",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>Verify this file in Build & Verify tab</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Agent Prompt */}
            {inspectorMode === "prompt" && (
              <div className="inspector-prompt-block" style={{ marginTop: "16px" }}>
                <div className="inspector-prompt-head">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Prompt for Step 0{selectedNode.step} (Paste Into Agent)
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-craft-secondary"
                    style={{
                      padding: "6px 14px",
                      fontSize: "11px",
                      background: "#26282b",
                      color: "#fff",
                      borderColor: "#3d4044",
                    }}
                    onClick={() =>
                      handleCopyStepPrompt(
                        selectedNode.stepPrompt,
                        selectedNode.title
                      )
                    }
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Step Prompt</span>
                  </button>
                </div>

                <pre className="inspector-prompt-pre">
                  {selectedNode.stepPrompt}
                </pre>
              </div>
            )}

            {/* TAB 3: Build & Verify (Deterministic Artifact Verification + Mentor Review) */}
            {inspectorMode === "review" && (
              <div
                style={{
                  marginTop: "16px",
                  background: "#ffffff",
                  border: "1.5px solid var(--border)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                {/* Sub-mode selector if milestone has starter artifacts */}
                {hasStarterArtifacts && (
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginBottom: "14px",
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setVerificationSubMode("artifact")}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: verificationSubMode === "artifact" ? "#1e293b" : "#f8fafc",
                        color: verificationSubMode === "artifact" ? "#ffffff" : "#475569",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Deterministic Artifact Verification</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerificationSubMode("mentor")}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: verificationSubMode === "mentor" ? "#1e293b" : "#f8fafc",
                        color: verificationSubMode === "mentor" ? "#ffffff" : "#475569",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Freeform Mentor Review</span>
                    </button>
                  </div>
                )}

                {/* SUB-VIEW A: DETERMINISTIC ARTIFACT VERIFICATION */}
                {hasStarterArtifacts && verificationSubMode === "artifact" && (
                  <div>
                    {/* Overall Milestone Completion Status Banner */}
                    <div
                      style={{
                        background: allArtifactsPassed ? "#f0fdf4" : "#ffffff",
                        border: `1px solid ${allArtifactsPassed ? "#86efac" : "var(--border-strong)"}`,
                        borderRadius: "10px",
                        padding: "14px 16px",
                        marginBottom: "14px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {allArtifactsPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-slate-500" />
                          )}
                          <strong
                            style={{
                              fontSize: "12.5px",
                              color: allArtifactsPassed ? "#166534" : "#0f172a",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            {allArtifactsPassed
                              ? `MILESTONE 0${selectedNode.step} VERIFIED: All ${starterArtifacts.length} artifacts passed`
                              : `Milestone Verification in Progress (${passedArtifactCount} of ${starterArtifacts.length} files verified)`}
                          </strong>
                        </div>

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            fontFamily: "var(--mono)",
                            color: allArtifactsPassed ? "#166534" : "#b45309",
                          }}
                        >
                          {passedArtifactCount}/{starterArtifacts.length} Done
                        </span>
                      </div>

                      <p style={{ fontSize: "11.5px", margin: "6px 0 0", color: "#475569", lineHeight: "1.4" }}>
                        {allArtifactsPassed
                          ? "All starter artifacts for this milestone satisfy Chrome Manifest V3 static structural checks. The milestone is marked verified."
                          : "Deterministic verification is multi-file aware: passing one file does NOT complete the milestone. You must submit and pass all required files."}
                      </p>
                    </div>

                    {/* Trust and Static Checks Scope Disclaimer */}
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 10px",
                        fontSize: "11px",
                        color: "#64748b",
                        lineHeight: "1.4",
                        marginBottom: "14px",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Static Structural Verification:</strong> Checks validate JSON syntax, Manifest V3 schema requirements,
                        and HTML document structure without running untrusted code on the server. Static validation does not execute
                        runtime Chrome extension APIs. Test execution live in Chrome by opening <code>chrome://extensions</code>,
                        enabling Developer mode, and clicking &ldquo;Load unpacked&rdquo;.
                      </span>
                    </div>

                    {/* Artifact Selector Tabs with Status Indicators */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                      {starterArtifacts.map((art) => {
                        const isSelected = art.filename === currentVerifyFilename;
                        const artKey = getArtifactKey(selectedNode.id, art.filename);
                        const rev = localArtifactReviews[artKey];
                        const userContent =
                          artifactSubmissions[artKey] !== undefined ? artifactSubmissions[artKey] : art.content;
                        const userHash = computeContentHash(userContent);
                        const isMod = Boolean(
                          rev &&
                          rev.verdict === "passed" &&
                          (typeof rev.contentHash !== "string" ||
                            rev.contentHash.length !== 64 ||
                            rev.contentHash !== userHash)
                        );
                        const isPassed = Boolean(
                          rev &&
                          rev.verdict === "passed" &&
                          typeof rev.contentHash === "string" &&
                          rev.contentHash.length === 64 &&
                          rev.contentHash === userHash
                        );
                        const isFailed = Boolean(rev && rev.verdict === "needs_work");

                        return (
                          <button
                            key={art.filename}
                            type="button"
                            onClick={() => setActiveReviewFilename(art.filename)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: `1.5px solid ${
                                isSelected ? "#0f172a" : isPassed ? "#86efac" : isFailed ? "#fca5a5" : "var(--border)"
                              }`,
                              background: isSelected ? "#0f172a" : isPassed ? "#f0fdf4" : isFailed ? "#fef2f2" : "#ffffff",
                              color: isSelected ? "#ffffff" : isPassed ? "#166534" : isFailed ? "#991b1b" : "#475569",
                              fontSize: "11.5px",
                              fontFamily: "var(--mono)",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>./{art.filename}</span>
                            {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                            {isFailed && <AlertCircle className="w-3 h-3 text-red-500" />}
                            {isMod && <span style={{ fontSize: "9px", color: "#f59e0b" }}>● modified</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Artifact Verification Form & Content Editor */}
                    <div
                      style={{
                        background: "#fafafa",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 700, color: "#334155" }}>
                            VERIFYING: ./{currentVerifyFilename}
                          </span>
                          {isContentModified && (
                            <span
                              style={{
                                fontSize: "9.5px",
                                fontFamily: "var(--mono)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: "#fffbeb",
                                color: "#b45309",
                                border: "1px solid #fde68a",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Modified since verification</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (currentVerifyArtifact) {
                              handleArtifactContentChange(
                                currentVerifyFilename,
                                currentVerifyArtifact.content
                              );
                            }
                          }}
                          style={{
                            fontSize: "10.5px",
                            fontFamily: "var(--mono)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border)",
                            background: "#ffffff",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          Reset to Template
                        </button>
                      </div>

                      <textarea
                        value={currentArtifactSubmission}
                        onChange={(e) =>
                          handleArtifactContentChange(currentVerifyFilename, e.target.value)
                        }
                        rows={7}
                        style={{
                          width: "100%",
                          fontFamily: "var(--mono)",
                          fontSize: "11.5px",
                          lineHeight: "1.4",
                          padding: "10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-strong)",
                          background: "#ffffff",
                          resize: "vertical",
                          marginBottom: "10px",
                        }}
                        disabled={isVerifyingArtifact}
                        placeholder={`Paste or edit ./${currentVerifyFilename}...`}
                      />

                      <button
                        type="button"
                        className="btn-craft-primary"
                        onClick={() => handleVerifyArtifact(currentVerifyFilename)}
                        disabled={isVerifyingArtifact}
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          fontSize: "12px",
                          padding: "9px",
                          background: "#0f172a",
                        }}
                      >
                        {isVerifyingArtifact ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Running Deterministic Checks...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Verify ./{currentVerifyFilename} (Deterministic Static Checks)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Itemized Checks Results (Authoritative Deterministic Results) */}
                    {currentArtifactReview && (
                      <div
                        style={{
                          background: currentArtifactReview.verdict === "passed" ? "#f0fdf4" : "#fffbeb",
                          border: `1.5px solid ${currentArtifactReview.verdict === "passed" ? "#86efac" : "#fde68a"}`,
                          borderRadius: "10px",
                          padding: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {currentArtifactReview.verdict === "passed" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            )}
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                color: currentArtifactReview.verdict === "passed" ? "#166534" : "#92400e",
                              }}
                            >
                              {currentArtifactReview.verdictLabel}
                            </span>
                          </div>

                          {currentArtifactReview.contentHash && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontFamily: "var(--mono)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: "#ffffff",
                                color: "#64748b",
                                border: "1px solid var(--border)",
                              }}
                              title="SHA-256 fingerprint of the verified content"
                            >
                              sha256:{currentArtifactReview.contentHash}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: "12.5px", lineHeight: "1.55", color: "var(--text)", marginBottom: "12px" }}>
                          <MarkdownContent content={currentArtifactReview.feedback} />
                        </div>

                        {/* Itemized Structured Checks List */}
                        {currentArtifactReview.checks && currentArtifactReview.checks.length > 0 && (
                          <div style={{ marginBottom: "12px" }}>
                            <div
                              style={{
                                fontSize: "10.5px",
                                fontFamily: "var(--mono)",
                                fontWeight: 700,
                                color: "#334155",
                                textTransform: "uppercase",
                                marginBottom: "6px",
                              }}
                            >
                              Itemized Static Checks ({currentArtifactReview.checks.filter((c) => c.passed).length}/{currentArtifactReview.checks.length} Passed):
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {currentArtifactReview.checks.map((chk: VerificationCheck) => (
                                <div
                                  key={chk.id}
                                  style={{
                                    background: chk.passed ? "#ffffff" : "#fef2f2",
                                    border: `1px solid ${chk.passed ? "#bbf7d0" : "#fecaca"}`,
                                    borderRadius: "6px",
                                    padding: "8px 10px",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    {chk.passed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                    )}
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: chk.passed ? "#166534" : "#991b1b",
                                      }}
                                    >
                                      {chk.label}
                                    </span>
                                  </div>
                                  {!chk.passed && chk.message && (
                                    <p
                                      style={{
                                        margin: "4px 0 0 22px",
                                        fontSize: "11.5px",
                                        color: "#b91c1c",
                                        lineHeight: "1.4",
                                      }}
                                    >
                                      {chk.message}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div
                          style={{
                            fontSize: "11.5px",
                            background: "rgba(255,255,255,0.75)",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            color: "var(--text)",
                          }}
                        >
                          <strong>Next Action:</strong> {currentArtifactReview.nextTip}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-VIEW B: ORDINARY MENTOR REVIEW */}
                {(!hasStarterArtifacts || verificationSubMode === "mentor") && (
                  <div>
                    {currentMentorReview && (
                      <div
                        style={{
                          background: currentMentorReview.verdict === "passed" ? "#f0fdf4" : "#fffbeb",
                          border: `1.5px solid ${currentMentorReview.verdict === "passed" ? "#86efac" : "#fde68a"}`,
                          borderRadius: "10px",
                          padding: "14px",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {currentMentorReview.verdict === "passed" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            )}
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                color: currentMentorReview.verdict === "passed" ? "#166534" : "#92400e",
                              }}
                            >
                              {currentMentorReview.verdictLabel}
                            </span>
                          </div>
                          <span style={{ fontSize: "10.5px", color: "var(--text-soft)" }}>
                            {new Date(currentMentorReview.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div style={{ fontSize: "13px", lineHeight: "1.55", color: "var(--text)", marginBottom: "10px" }}>
                          <MarkdownContent content={currentMentorReview.feedback} />
                        </div>

                        {currentMentorReview.positivePoints && currentMentorReview.positivePoints.length > 0 && (
                          <div style={{ marginBottom: "8px" }}>
                            <div style={{ fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: "4px" }}>
                              ✓ Strengths:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)" }}>
                              {currentMentorReview.positivePoints.map((p, idx) => (
                                <li key={idx}>
                                  <InlineMarkdown text={p} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {currentMentorReview.suggestedFixes && currentMentorReview.suggestedFixes.length > 0 && (
                          <div style={{ marginBottom: "8px" }}>
                            <div style={{ fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 700, color: "#92400e", textTransform: "uppercase", marginBottom: "4px" }}>
                              ✦ Recommendations:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)" }}>
                              {currentMentorReview.suggestedFixes.map((f, idx) => (
                                <li key={idx}>
                                  <InlineMarkdown text={f} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div style={{ fontSize: "11.5px", background: "rgba(255,255,255,0.7)", padding: "6px 10px", borderRadius: "6px", color: "var(--text)" }}>
                          <strong>Next Tip:</strong> <InlineMarkdown text={currentMentorReview.nextTip} />
                        </div>
                      </div>
                    )}

                    {/* Freeform Submission Form */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label style={{ fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--text-soft)" }}>
                          Submit Work for Mentor Review
                        </label>

                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => setSubmissionType("code")}
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--mono)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                              background: submissionType === "code" ? "#18191a" : "#fff",
                              color: submissionType === "code" ? "#fff" : "var(--text-muted)",
                              cursor: "pointer",
                            }}
                          >
                            Code
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubmissionType("summary")}
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--mono)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                              background: submissionType === "summary" ? "#18191a" : "#fff",
                              color: submissionType === "summary" ? "#fff" : "var(--text-muted)",
                              cursor: "pointer",
                            }}
                          >
                            Terminal Output
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubmissionType("question")}
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--mono)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                              background: submissionType === "question" ? "#18191a" : "#fff",
                              color: submissionType === "question" ? "#fff" : "var(--text-muted)",
                              cursor: "pointer",
                            }}
                          >
                            Question
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder={
                          submissionType === "code"
                            ? `Paste your code snippet from ${selectedNode.filesToCreate[0] || "your files"}...`
                            : submissionType === "summary"
                            ? "Paste your terminal output, test results, or dev server log..."
                            : "Ask a question about completing this milestone..."
                        }
                        rows={4}
                        style={{
                          width: "100%",
                          fontFamily: submissionType === "code" ? "var(--mono)" : "inherit",
                          fontSize: "12px",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-strong)",
                          background: "var(--surface-alt)",
                          resize: "vertical",
                          marginBottom: "10px",
                        }}
                        disabled={isReviewing}
                      />

                      <button
                        type="button"
                        className="btn-craft-primary"
                        onClick={handleRunMentorReview}
                        disabled={isReviewing || submissionText.trim().length < 5}
                        style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "9px" }}
                      >
                        {isReviewing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Evaluating Submission...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit for Verification</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
