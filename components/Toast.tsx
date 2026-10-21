"use client";

import React from "react";
import { Check } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export function Toast({ message, isVisible }: ToastProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-accent/15 border border-accent/40 backdrop-blur-md px-4 py-2.5 text-sm text-accent shadow-lg shadow-black/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
      <Check className="w-4 h-4 text-accent shrink-0" />
      <span className="font-medium tracking-wide">{message}</span>
    </div>
  );
}
