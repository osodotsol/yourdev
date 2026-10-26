"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  color?: string;
  wordmarkColor?: string;
}

export function Logo({
  size = 30,
  className = "",
  showWordmark = true,
  color = "#18191a",
  wordmarkColor,
}: LogoProps) {
  const resolvedWordmarkColor =
    wordmarkColor || (color !== "#18191a" ? color : "var(--text)");

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision Geometric Monoline Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="YourDev logo"
      >
        {/* Continuous rounded triangular ribbon with inner hook */}
        <path
          d="M 58 102 
             C 74 100 90 92 98 78 
             C 107 63 98 48 83 25 
             L 71 8 
             C 66 1 54 1 49 8 
             L 14 62 
             C 4 77 9 92 23 99 
             C 36 106 50 100 56 86 
             L 57 60 
             L 43 60 
             L 43 83 
             C 40 91 32 94 25 89 
             C 17 84 16 75 24 64 
             L 56 16 
             C 58 13 62 13 64 16 
             L 86 52 
             C 95 67 96 76 89 84 
             C 83 91 73 93 60 92 
             Z"
          fill={color}
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "var(--sans)",
            fontWeight: 800,
            fontSize: `${Math.round(size * 0.62)}px`,
            letterSpacing: "-0.04em",
            color: resolvedWordmarkColor,
            lineHeight: 1,
          }}
        >
          YourDev
        </span>
      )}
    </div>
  );
}
