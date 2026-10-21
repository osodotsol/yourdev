"use client";

import React, { useState } from "react";
import { RoadmapNode } from "@/types/blueprint";
import {
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  Code2,
  FileCode,
  Sparkles,
  ArrowDown,
} from "lucide-react";

interface RoadmapGraphProps {
  nodes: RoadmapNode[];
  onShowToast: (msg: string) => void;
}

export function RoadmapGraph({ nodes, onShowToast }: RoadmapGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    nodes[0]?.id || "node-1"
  );
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const toggleNodeCompletion = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCompletedNodeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyStepPrompt = async (prompt: string, stepTitle: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      onShowToast(`✓ PROMPT FOR STEP COPIED TO CLIPBOARD`);
    } catch {
      onShowToast("Failed to copy prompt.");
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
            ✦ INTERACTIVE ARCHITECTURE ROADMAP // POWERED BY PATTERN BANK
          </div>
          <h3 className="roadmap-studio-title">
            Visual Execution Tree & Step-by-Step Prompt Queue
          </h3>
          <p className="roadmap-studio-desc">
            Inspired by roadmap.sh: Click any milestone node to view its exact files,
            architecture rules, and single-slice prompt to paste into your AI agent.
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

        {/* Right Column: Node Inspector & Agent Prompt Drawer */}
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

            {/* Step-by-Step AI Agent Prompt (The Slicing Superpower) */}
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
          </div>
        )}
      </div>
    </div>
  );
}
