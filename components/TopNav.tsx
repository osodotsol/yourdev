"use client";

import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

interface TopNavProps {
  onOpenMentor?: () => void;
}

const LINKS = [
  { href: "#problem", label: "Problem", index: "01" },
  { href: "#how", label: "How it works", index: "02" },
  { href: "#console", label: "Console", index: "03" },
  { href: "#output", label: "Blueprint", index: "04" },
  { href: "#mentor", label: "Mentor", index: "05" },
  { href: "/studio-demo", label: "Studio", index: "↗" },
];

export function TopNav({ onOpenMentor }: TopNavProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 920) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const openMentor = () => {
    setMenuOpen(false);
    onOpenMentor?.();
  };

  return (
    <header className="site-header" id="top">
      <div className="site-header-inner">
        {/* Mobile menu toggle sits at the far left; hidden on desktop. */}
        <button
          type="button"
          className="site-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
        </button>

        <a href="#top" className="site-brand" aria-label="YourDev, back to top">
          <Logo size={22} />
        </a>

        <nav className="site-nav" aria-label="Main">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-actions">
          {onOpenMentor && (
            <button
              type="button"
              id="topnav-ask-mentor"
              onClick={openMentor}
              className="btn btn-ghost btn-sm site-mentor-btn"
              aria-label="Ask Devi, your coding mentor"
            >
              <img
                src="/images/devi-avatar-128.jpg"
                alt=""
                width={24}
                height={24}
                className="avatar"
              />
              <span className="site-mentor-text">Ask Devi</span>
            </button>
          )}
          <a href="#console" className="btn btn-primary btn-sm site-cta">
            Start building
          </a>
        </div>
      </div>

      <div id="site-menu" className="site-menu" hidden={!menuOpen}>
        <nav aria-label="Main (mobile)">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
              <span aria-hidden="true">{link.index}</span>
            </a>
          ))}
        </nav>
        <div className="site-menu-actions">
          {onOpenMentor && (
            <button type="button" className="btn btn-secondary" onClick={openMentor}>
              Ask Devi
            </button>
          )}
          <a href="#console" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
            Start building
          </a>
        </div>
      </div>
    </header>
  );
}
