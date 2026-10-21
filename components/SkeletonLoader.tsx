"use client";

import React from "react";

export function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-2xl border border-borderMuted bg-panel/70 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-lg bg-zinc-800/80" />
            <div className="h-4 w-72 rounded-md bg-zinc-800/50" />
          </div>
          <div className="h-10 w-36 rounded-full bg-zinc-800/80" />
        </div>
      </div>

      {/* 5 Card Skeletons */}
      {[
        { title: "Phased Roadmap", items: 3 },
        { title: "Immediate Next Actions", items: 4 },
        { title: "Recommended Tech Stack", items: 3 },
        { title: "Free Learning Resources", items: 3 },
        { title: "AI Coding Agent Guide", items: 2 },
      ].map((card, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-borderMuted bg-card/60 p-6 backdrop-blur-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-zinc-800/80" />
            <div className="h-5 w-44 rounded-md bg-zinc-800/70" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: card.items }).map((_, itemIdx) => (
              <div
                key={itemIdx}
                className="h-14 rounded-xl bg-zinc-800/40 border border-zinc-800/50"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
