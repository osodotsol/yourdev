"use client";

import React, { useState } from "react";
import {
  Milestone,
  CheckCircle2,
  Cpu,
  BookOpen,
  Bot,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { IdeaBlueprint } from "@/types/blueprint";
import { formatBlueprintMarkdown } from "@/lib/clipboard";

interface ResultsCardsProps {
  blueprint: IdeaBlueprint;
  onReset: () => void;
  onShowToast: (msg: string) => void;
}

export function ResultsCards({
  blueprint,
  onReset,
  onShowToast,
}: ResultsCardsProps) {
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyBlueprint = async () => {
    try {
      const markdown = formatBlueprintMarkdown(blueprint);
      await navigator.clipboard.writeText(markdown);
      setCopiedBlueprint(true);
      onShowToast("Complete blueprint copied to clipboard!");
      setTimeout(() => setCopiedBlueprint(false), 2000);
    } catch {
      onShowToast("Failed to copy to clipboard.");
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(blueprint.agentGuide.firstPrompt);
      setCopiedPrompt(true);
      onShowToast("First prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      onShowToast("Failed to copy prompt.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-borderMuted bg-panel/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 font-semibold">
                Generated Blueprint
              </span>
              {blueprint.isFallback && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08]">
                  Smart Fallback Engine
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {blueprint.projectTitle}
            </h2>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              {blueprint.summary}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyBlueprint}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide bg-accent hover:bg-accent-light text-zinc-950 flex items-center justify-center gap-2 shadow-md shadow-accent/20 transition-all duration-150 active:scale-95"
            >
              {copiedBlueprint ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Blueprint</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white bg-card hover:bg-cardHover border border-borderMuted hover:border-borderHover flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refine Idea</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 1: Phased Roadmap */}
      <section className="rounded-2xl border border-borderMuted bg-card/80 p-6 md:p-7 backdrop-blur-sm transition-all hover:border-borderHover">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Milestone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              1. Phased Roadmap
            </h3>
            <p className="text-xs text-zinc-400">
              Sequence of deliverable milestones — build each before advancing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {blueprint.roadmap.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-borderMuted/80 bg-panel/60 p-4 space-y-2 hover:border-accent/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold border border-accent/20">
                  {item.phase}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Step 0{idx + 1}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-100">
                {item.title}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Card 2: Immediate Next Actions */}
      <section className="rounded-2xl border border-borderMuted bg-card/80 p-6 md:p-7 backdrop-blur-sm transition-all hover:border-borderHover">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              2. Immediate Next Actions
            </h3>
            <p className="text-xs text-zinc-400">
              Concrete steps to start building right now
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {blueprint.nextActions.map((action) => (
            <div
              key={action.step}
              className="flex items-start gap-3.5 p-3.5 rounded-xl border border-borderMuted/80 bg-panel/60 hover:border-sky-500/30 transition-all"
            >
              <span className="w-6 h-6 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                {action.step}
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-zinc-100">
                  {action.action}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {action.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Card 3: Recommended Tech Stack */}
      <section className="rounded-2xl border border-borderMuted bg-card/80 p-6 md:p-7 backdrop-blur-sm transition-all hover:border-borderHover">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              3. Recommended Tech Stack
            </h3>
            <p className="text-xs text-zinc-400">
              Modern zero-friction tools chosen for speed and agent compatibility
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
          {blueprint.techStack.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-borderMuted/80 bg-panel/60 hover:border-amber-500/30 transition-all space-y-1.5"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80 font-medium">
                {item.category}
              </span>
              <h4 className="text-sm font-bold text-white font-mono">
                {item.name}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Card 4: Free Learning Resources */}
      <section className="rounded-2xl border border-borderMuted bg-card/80 p-6 md:p-7 backdrop-blur-sm transition-all hover:border-borderHover">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              4. Free Learning Resources
            </h3>
            <p className="text-xs text-zinc-400">
              Curated official documentation and zero-cost tutorials
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {blueprint.resources.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-xl border border-borderMuted/80 bg-panel/60 hover:border-purple-500/40 hover:bg-card transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-medium border border-purple-500/30">
                  {res.type}
                </span>
                <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-purple-200 transition-colors pt-1">
                  {res.title}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-purple-300 font-mono">
                <span>Open guide</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Card 5: AI Coding Agent Guide & First Prompt */}
      <section className="rounded-2xl border border-accent/30 bg-panel/90 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-black/40">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-lg bg-accent/15 text-accent border border-accent/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              5. AI Coding Agent Guide & First Prompt
            </h3>
            <p className="text-xs text-zinc-400">
              How to pair with Cursor, Claude, or Copilot effectively
            </p>
          </div>
        </div>

        {/* Workflow Tips */}
        <div className="space-y-2 mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
            Recommended Workflow Rules:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {blueprint.agentGuide.workflowTips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-zinc-300 bg-black/40 p-3 rounded-lg border border-borderMuted"
              >
                <span className="text-accent font-mono font-bold">›</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* "First Prompt to Use" Dedicated Box */}
        <div className="rounded-xl border border-accent/40 bg-black/60 p-5 space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-accent">
                First Prompt to Send to Your Coding Agent
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyPrompt}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-xs md:text-sm font-mono text-zinc-200 bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-white/5">
            {blueprint.agentGuide.firstPrompt}
          </pre>
        </div>
      </section>

      {/* Bottom CTA to restart */}
      <div className="text-center pt-4 pb-8">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono text-zinc-400 hover:text-white bg-card hover:bg-cardHover border border-borderMuted transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Break down another project idea</span>
        </button>
      </div>
    </div>
  );
}
