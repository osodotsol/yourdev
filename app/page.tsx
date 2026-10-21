"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { HeroSection } from "@/components/HeroSection";
import { PillarsBar } from "@/components/PillarsBar";
import { ProblemSection } from "@/components/ProblemSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ConsoleSection } from "@/components/ConsoleSection";
import { OutputSection } from "@/components/OutputSection";
import { SiteFooter } from "@/components/SiteFooter";
import { IdeaBlueprint } from "@/types/blueprint";
import { generateBlueprint } from "@/lib/fallbackGenerator";

const DEFAULT_SAMPLE_BLUEPRINT: IdeaBlueprint = generateBlueprint(
  "I want to build a simple habit tracker with AI that helps me stay consistent, gives me daily reminders, and awards fun badges when I hit a 7-day streak."
);

export default function Home() {
  const [blueprint, setBlueprint] = useState<IdeaBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  const handleBreakdown = (text: string, choices?: Record<string, string>) => {
    setIsLoading(true);

    setTimeout(() => {
      const generated = generateBlueprint(text, choices);
      setBlueprint(generated);
      setIsLoading(false);
      triggerToast("✓ STRATEGY BLUEPRINT GENERATED");

      const consoleEl = document.getElementById("console");
      if (consoleEl) {
        consoleEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 700);
  };

  const handleClear = () => {
    setBlueprint(null);
  };

  return (
    <main className="min-h-screen relative">
      <div className="app-backdrop" />

      {/* Floating Pill Nav */}
      <TopNav />

      {/* Main Container */}
      <div className="page-container">
        {/* Hero Section */}
        <HeroSection />

        {/* 4-Feature Strip */}
        <PillarsBar />

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
      </div>

      {/* Dark Craft Footer */}
      <SiteFooter />

      {/* Toast Notification */}
      <div className={`craft-toast ${showToast ? "show" : ""}`}>
        {toastMessage}
      </div>
    </main>
  );
}
