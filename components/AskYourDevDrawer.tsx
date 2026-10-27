"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  Terminal,
  ShieldCheck,
  Check,
} from "lucide-react";
import { ChatMessage, ChatProjectContext, ChatResponseBody } from "@/types/chat";
import {
  loadChatMessages,
  saveChatMessages,
  clearChatMessages,
  normalizeProjectId,
} from "@/lib/chatPersistence";
import { MarkdownContent } from "@/components/MarkdownRenderer";

interface AskYourDevDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context?: ChatProjectContext;
}

export function AskYourDevDrawer({
  isOpen,
  onClose,
  context,
}: AskYourDevDrawerProps) {
  const projectId = context?.projectId || "default-project";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [includeErrorContext, setIncludeErrorContext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat messages when project ID changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      const saved = loadChatMessages(projectId);
      if (saved.length > 0) {
        setMessages(saved);
      } else {
        // Welcoming starter message grounded in the project
        const projectTitle = context?.projectTitle || "your project";
        const milestoneTitle = context?.activeMilestone?.title;
        const welcomeText = milestoneTitle
          ? `Hi, I’m **Devi**, your YourDev coding mentor.\n\nI see you are building **${projectTitle}** and currently working on **Step ${context?.activeMilestone?.step}: ${milestoneTitle}**.\n\nHow can I help you understand the architecture, diagnose a bug, or decide on your next step?`
          : `Hi, I’m **Devi**, your YourDev pair-programming mentor for **${projectTitle}**.\n\nAsk me anything about your project's architecture, recommended tech stack, or how to get started!`;

        const initialMsg: ChatMessage = {
          id: "welcome-msg",
          role: "mentor",
          content: welcomeText,
          timestamp: Date.now(),
        };
        setMessages([initialMsg]);
        saveChatMessages(projectId, [initialMsg]);
      }
    }
  }, [isOpen, projectId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputText("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatMessages(projectId, newMessages);
    setIsLoading(true);

    try {
      // Build size-bounded context package
      const boundedContext: ChatProjectContext = {
        projectId: normalizeProjectId(context?.projectId),
        projectTitle: (context?.projectTitle || "Untitled Project").slice(0, 200),
        projectIdea: context?.projectIdea?.slice(0, 1500),
        projectType: context?.projectType?.slice(0, 50),
        techStack: context?.techStack?.slice(0, 10),
        activeMilestone: context?.activeMilestone
          ? {
              step: context.activeMilestone.step,
              title: context.activeMilestone.title.slice(0, 150),
              goal: context.activeMilestone.goal.slice(0, 300),
              filesToCreate: context.activeMilestone.filesToCreate?.slice(0, 5),
              definitionOfDone: context.activeMilestone.definitionOfDone?.slice(0, 5),
            }
          : undefined,
        recentVerification: context?.recentVerification,
        userErrorMessage: includeErrorContext ? context?.userErrorMessage?.slice(0, 1000) : undefined,
        userCodeExcerpt: includeErrorContext ? context?.userCodeExcerpt?.slice(0, 2000) : undefined,
      };

      // Send recent conversation history (max 8 messages for context bounding)
      const historyPayload = newMessages.slice(-8, -1).map((m) => ({
        role: m.role,
        content: m.content.slice(0, 1500),
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: boundedContext,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate limit reached. Please wait a moment before sending another message.");
        }
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server returned error (${res.status})`);
      }

      const data: ChatResponseBody = await res.json();

      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        role: "mentor",
        content: data.reply,
        timestamp: data.timestamp || Date.now(),
        isOffline: data.isOffline,
      };

      const finalMessages = [...newMessages, mentorMsg];
      setMessages(finalMessages);
      saveChatMessages(projectId, finalMessages);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reach mentor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewChat = () => {
    if (window.confirm("Start a new conversation for this project? Previous messages will be cleared.")) {
      clearChatMessages(projectId);
      const resetMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: "mentor",
        content: `Conversation reset. I am ready with fresh context for **${context?.projectTitle || "your project"}**!`,
        timestamp: Date.now(),
      };
      setMessages([resetMsg]);
      saveChatMessages(projectId, [resetMsg]);
      setErrorMessage(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Side Drawer */}
      <aside
        id="ask-yourdev-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Ask YourDev Coding Mentor"
        className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[450px] bg-paper border-l border-ink/15 shadow-2xl flex flex-col transition-transform duration-200 ease-out"
        style={{ fontFamily: "var(--sans)" }}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-ink text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400/50 shrink-0 bg-paper shadow-xs">
              <img
                src="/images/devi-avatar-128.jpg"
                alt="Devi"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">Devi</span>
                <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Mentor
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-none mt-0.5">
                YourDev guided pairing companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleStartNewChat}
              title="Start a new conversation"
              aria-label="Start a new conversation"
              className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close mentor panel (Esc)"
              aria-label="Close mentor panel"
              className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Context Bar */}
        <div className="px-4 py-2 bg-paper-sunk border-b border-ink/10 text-xs text-ink-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-xs font-bold uppercase text-ink-3">Context:</span>
              <strong className="text-ink truncate">
                {context?.projectTitle || "Active Project"}
              </strong>
              {context?.activeMilestone && (
                <span className="text-xs text-slate-500 truncate">
                  · Step {context.activeMilestone.step}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowContextDetails(!showContextDetails)}
              className="text-xs text-ink-2 hover:text-ink flex items-center gap-0.5 font-medium shrink-0 ml-2 py-2 px-1 -my-2"
            >
              <span>{showContextDetails ? "Hide" : "Inspect"}</span>
              {showContextDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showContextDetails && (
            <div className="mt-2 pt-2 border-t border-ink/10 text-xs space-y-1 text-slate-600">
              {context?.techStack && context.techStack.length > 0 && (
                <div>
                  <span className="font-mono text-xs text-slate-400">Stack: </span>
                  {context.techStack.join(", ")}
                </div>
              )}
              {context?.activeMilestone && (
                <div>
                  <span className="font-mono text-xs text-slate-400">Goal: </span>
                  {context.activeMilestone.goal}
                </div>
              )}
              {context?.userErrorMessage && (
                <div className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                  <span className="font-mono text-xs font-bold">Recent Error: </span>
                  {context.userErrorMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {!isUser && (
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-emerald-500/40 shrink-0">
                      <img src="/images/devi-avatar-128.jpg" alt="" width={16} height={16} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="text-xs font-mono text-slate-600 font-semibold">
                    {isUser ? "You" : "Devi (Mentor)"}
                  </span>
                  {msg.isOffline && !isUser && (
                    <span className="text-[11px] font-mono uppercase px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold border border-amber-200">
                      Offline Mode
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? "bg-ink text-white rounded-br-xs"
                      : "bg-white text-ink border border-ink/10 rounded-bl-xs"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownContent content={msg.content} />
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-xs font-mono text-slate-500 font-medium">
                  Ask YourDev
                </span>
              </div>
              <div className="bg-white border border-ink/10 rounded-2xl rounded-bl-xs px-4 py-3 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Consulting mentor...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="mt-1 text-xs text-rose-700 underline font-medium hover:text-rose-900"
                >
                  Retry request
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-ink/[0.08] bg-paper shrink-0">
            <span className="text-xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "What should I build next in this milestone?",
                "How do I prevent state synchronization bugs?",
                "Explain the architecture choices for this project",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  disabled={isLoading}
                  className="text-[13px] bg-white border border-ink/15 hover:border-ink/40 px-3 py-1.5 rounded-md text-slate-700 hover:text-black transition-colors disabled:opacity-50 text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box Footer */}
        <div className="p-4 bg-white border-t border-ink/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex flex-col gap-2"
          >
            <div className="relative">
              <textarea
                aria-label="Message Devi"
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                rows={3}
                placeholder="Ask about your code, errors, or next milestone... (Enter to send, Shift+Enter for newline)"
                className="w-full text-base sm:text-sm p-3 pr-12 rounded-xl border border-ink/20 focus:outline-hidden focus:border-ink focus:ring-1 focus:ring-ink resize-none bg-paper placeholder:text-slate-400 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                title="Send message"
                aria-label="Send message"
                className="absolute right-2.5 bottom-3.5 p-2.5 bg-ink text-white rounded-lg hover:bg-black transition-colors disabled:opacity-40 disabled:hover:bg-ink"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="text-xs font-mono">
                {inputText.length > 0 ? `${inputText.length} / 2000 chars` : "Press Enter to send"}
              </span>
              <span className="text-xs text-slate-400">
                Safe inert markdown · No autonomous execution
              </span>
            </div>
          </form>
        </div>
      </aside>
    </>
  );
}
