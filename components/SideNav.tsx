"use client";

import React, { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "hero", label: "Top" },
  { id: "problem", label: "Problem" },
  { id: "how", label: "How It Works" },
  { id: "console", label: "Live Console" },
  { id: "output", label: "Output" },
  { id: "architecture", label: "Architecture" },
  { id: "beginners", label: "For Beginners" },
  { id: "files", label: "File Map" },
];

export function SideNav() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="side-nav" id="sideNav" aria-label="Quick Section Navigation">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={activeSection === item.id ? "active" : ""}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
