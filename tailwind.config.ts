import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#08090c",
        panel: "#0e1015",
        card: "#14171f",
        cardHover: "#181c26",
        borderMuted: "rgba(255, 255, 255, 0.08)",
        borderHover: "rgba(255, 255, 255, 0.16)",
        accent: {
          DEFAULT: "#8fd3ad",
          light: "#a8e5c2",
          dark: "#6bb98f",
          glow: "rgba(143, 211, 173, 0.15)",
        },
        amberAccent: {
          DEFAULT: "#e8a849",
          glow: "rgba(232, 168, 73, 0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
