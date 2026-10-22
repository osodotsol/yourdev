"use client";

import React, { useState } from "react";
import { RoadmapNode, StepReviewResult } from "@/types/blueprint";
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
} from "lucide-react";

interface RoadmapGraphProps {
  nodes: RoadmapNode[];
  ideaText?: string;
  completedNodeIds?: string[];
  onToggleNode?: (nodeId: string) => void;
  savedReviews?: Record<string, StepReviewResult>;
  onSaveReview?: (stepId: string, review: StepReviewResult) => void;
  onShowToast: (msg: string) => void;
}

export function RoadmapGraph({
  nodes,
  ideaText = "",
  completedNodeIds: externalCompletedNodeIds,
  onToggleNode,
  savedReviews = {},
  onSaveReview,
  onShowToast,
}: RoadmapGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id || "node-1"
  );
  const [internalCompletedNodeIds, setInternalCompletedNodeIds] = useState<string[]>([]);
  const [inspectorMode, setInspectorMode] = useState<"prompt" | "review">("prompt");
  const [submissionText, setSubmissionText] = useState("");
  const [submissionType, setSubmissionType] = useState<"code" | "summary" | "question">("code");
  const [isReviewing, setIsReviewing] = useState(false);
  const [localReviews, setLocalReviews] = useState<Record<string, StepReviewResult>>(savedReviews);

  const completedNodeIds = externalCompletedNodeIds || internalCompletedNodeIds;

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const currentReview = localReviews[selectedNode.id];

  const toggleNodeCompletion = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onToggleNode) {
      onToggleNode(id);
    } else {
      setInternalCompletedNodeIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
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
          // Mark step as completed if not already done
          if (!completedNodeIds.includes(selectedNode.id)) {
            if (onToggleNode) {
              onToggleNode(selectedNode.id);
            } else {
              setInternalCompletedNodeIds((prev) => [...prev, selectedNode.id]);
            }
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
            ✦ INTERACTIVE ARCHITECTURE ROADMAP // MENTOR STUDIO
          </div>
          <h3 className="roadmap-studio-title">
            Visual Execution Tree & Verification Queue
          </h3>
          <p className="roadmap-studio-desc">
            Click any milestone node to view its target files, copy single-slice prompts,
            or submit your code for step-by-step mentor verification.
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

            return (
              <React.Fragment key={node.id}>
                <div
                  className={`roadmap-node-card ${
                    isSelected ? "is-active" : ""
                  } ${isCompleted ? "is-completed" : ""}`}
                  onClick={() => setSelectedNodeId(node.id)}
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

                      {hasReview && (
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
                        isSelected ? "rotate-90 text-amber-500" : "text-gray-400"
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

        {/* Right Column: Node Inspector & Agent Prompt / Mentor Review Drawer */}
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
              <p className="inspector-goal">{selectedNode.goal}</p>
            </div>

            {/* Target Files to Create */}
            <div className="inspector-section">
              <div className="inspector-sec-label">Target Files to Create / Edit:</div>
              <div className="inspector-files-grid">
                {selectedNode.filesToCreate.map((f, i) => (
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
                <div className="inspector-sec-label">Verified Official Docs:</div>
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
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Switcher for Inspector: Step Prompt vs Mentor Review */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "18px",
                padding: "4px",
                background: "var(--surface-alt)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
              }}
            >
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
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mentor Review</span>
                {currentReview && (
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: currentReview.verdict === "passed" ? "#10b981" : "#f59e0b",
                    }}
                  />
                )}
              </button>
            </div>

            {/* TAB 1: Step-by-Step AI Agent Prompt */}
            {inspectorMode === "prompt" && (
              <div className="inspector-prompt-block">
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

            {/* TAB 2: Interactive Mentor Review & Verification Loop */}
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
                {/* Existing Review Verdict */}
                {currentReview && (
                  <div
                    style={{
                      background: currentReview.verdict === "passed" ? "#f0fdf4" : "#fffbeb",
                      border: `1.5px solid ${currentReview.verdict === "passed" ? "#86efac" : "#fde68a"}`,
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {currentReview.verdict === "passed" ? (
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
                            color: currentReview.verdict === "passed" ? "#166534" : "#92400e",
                          }}
                        >
                          {currentReview.verdictLabel}
                        </span>
                      </div>
                      <span style={{ fontSize: "10.5px", color: "var(--text-soft)" }}>
                        {new Date(currentReview.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text)", marginBottom: "10px" }}>
                      {currentReview.feedback}
                    </p>

                    {currentReview.positivePoints && currentReview.positivePoints.length > 0 && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: "4px" }}>
                          ✓ Strengths:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)" }}>
                          {currentReview.positivePoints.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentReview.suggestedFixes && currentReview.suggestedFixes.length > 0 && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", fontFamily: "var(--mono)", fontWeight: 700, color: "#92400e", textTransform: "uppercase", marginBottom: "4px" }}>
                          ✦ Recommendations:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted)" }}>
                          {currentReview.suggestedFixes.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ fontSize: "11.5px", background: "rgba(255,255,255,0.7)", padding: "6px 10px", borderRadius: "6px", color: "var(--text)" }}>
                      <strong>Next Tip:</strong> {currentReview.nextTip}
                    </div>
                  </div>
                )}

                {/* Submission Form */}
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
    </div>
  );
}
