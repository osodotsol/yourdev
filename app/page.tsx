"use client";

import React, { useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { HeroSection } from "@/components/HeroSection";
import { ProblemSection } from "@/components/ProblemSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ConsoleSection } from "@/components/ConsoleSection";
import { OutputSection } from "@/components/OutputSection";
import { MentorSection } from "@/components/MentorSection";
import { SiteFooter } from "@/components/SiteFooter";
import { IdeaBlueprint } from "@/types/blueprint";
import { generateBlueprint } from "@/lib/fallbackGenerator";
import { loadSession, saveSession, clearSession } from "@/lib/persistence";
import { AskYourDevDrawer } from "@/components/AskYourDevDrawer";

const DEFAULT_SAMPLE_BLUEPRINT: IdeaBlueprint = generateBlueprint(
  "I want to build a simple habit tracker with AI that helps me stay consistent, gives me daily reminders, and awards fun badges when I hit a 7-day streak."
);

export default function Home() {
  const [blueprint, setBlueprint] = useState<IdeaBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);

  useEffect(() => {
    const saved = loadSession();
    if (saved.blueprint) {
      setBlueprint(saved.blueprint);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  const handleBreakdown = async (text: string, choices?: Record<string, string>) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: text, choices }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.blueprint) {
        setBlueprint(data.blueprint);
        saveSession({ blueprint: data.blueprint, rawIdea: text, userChoices: choices });
        triggerToast("✦ TAILORED STRATEGY GENERATED");
      } else {
        throw new Error("No blueprint returned in payload");
      }
    } catch (err) {
      console.warn("Client fallback activated:", err);
      const fallback = generateBlueprint(text, choices);
      setBlueprint(fallback);
      saveSession({ blueprint: fallback, rawIdea: text, userChoices: choices });
      triggerToast("✓ STRATEGY BLUEPRINT GENERATED");
    } finally {
      setIsLoading(false);
      const consoleEl = document.getElementById("console");
      if (consoleEl) {
        consoleEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleClear = () => {
    setBlueprint(null);
    clearSession();
  };

  const openMentor = () => setIsMentorOpen(true);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Sticky header; Ask Devi stays reachable at every width */}
      <TopNav onOpenMentor={openMentor} />

      <main id="main" className="page-container">
        <HeroSection />

        {/* 01 / The Problem */}
        <ProblemSection />

        {/* 02 / How It Works */}
        <HowItWorksSection />

        {/* 03 / Live Interactive Console */}
        <ConsoleSection
          blueprint={blueprint}
          isLoading={isLoading}
          onBreakdown={handleBreakdown}
          onClear={handleClear}
          onShowToast={triggerToast}
        />

        {/* 04 / The Output Specification (#output) */}
        <OutputSection />

        {/* 05 / Mentor */}
        <MentorSection onOpenMentor={openMentor} />
      </main>

      <SiteFooter />

      {/* Ask YourDev Mentor Side Drawer */}
      <AskYourDevDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        context={{
          projectId: blueprint?.projectTitle || "home-workspace",
          projectTitle: blueprint?.projectTitle || "Your Project",
          projectIdea: blueprint?.summary,
          projectType: blueprint?.architecture?.project_type,
          techStack: blueprint?.techStack?.map((s) => `${s.category}: ${s.name}`),
          activeMilestone: blueprint?.nodes?.[0]
            ? {
                step: blueprint.nodes[0].step,
                title: blueprint.nodes[0].title,
                goal: blueprint.nodes[0].goal,
                filesToCreate: blueprint.nodes[0].filesToCreate,
                definitionOfDone: blueprint.nodes[0].definitionOfDone,
              }
            : undefined,
        }}
      />

      {/* Toast Notification */}
      <div className={`craft-toast ${showToast ? "show" : ""}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </>
  );
}
