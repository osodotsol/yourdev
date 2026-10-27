import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

// Design tokens are defined once as RGB channels in app/globals.css (:root)
// and surfaced here so utilities support opacity modifiers (e.g. border-ink/10).
const token = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

// Warm neutral, deep green, amber and red scales. Tailwind's stock palettes are
// remapped onto these so legacy utility classes (slate, emerald, amber, rose…)
// inherit the brand palette instead of drifting into cool SaaS greys.
const neutral = {
  50: "#faf8f3",
  100: "#f2eee5",
  200: "#e4ded1",
  300: "#cfc7b6",
  400: "#a39b8a",
  500: "#7c7566",
  600: "#5e584b",
  700: "#464137",
  800: "#2e2a23",
  900: "#1f1c17",
  950: "#14120e",
};
const green = {
  50: "#eef4ef",
  100: "#dbe8dd",
  200: "#b9d3be",
  300: "#8fb79a",
  400: "#6aa07c",
  500: "#3d7a54",
  600: "#26694a",
  700: "#1d5a3b",
  800: "#18452f",
  900: "#133826",
  950: "#0b2318",
};
const amber = {
  50: "#fbf3e4",
  100: "#f6e5c4",
  200: "#eccd94",
  300: "#e0b061",
  400: "#d4953a",
  500: "#c27d22",
  600: "#a6661a",
  700: "#864f17",
  800: "#6b3f16",
  900: "#573414",
  950: "#2f1b09",
};
const red = {
  50: "#faeeeb",
  100: "#f4d9d2",
  200: "#e8b3a6",
  300: "#d98a78",
  400: "#c7634e",
  500: "#b44a35",
  600: "#9c3a28",
  700: "#7f2f21",
  800: "#66271d",
  900: "#53221a",
  950: "#2c110c",
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: token("ink"),
          2: token("ink-2"),
          3: token("ink-3"),
          4: token("ink-4"),
        },
        paper: {
          DEFAULT: token("paper"),
          sunk: token("paper-sunk"),
          deep: token("paper-deep"),
        },
        sheet: token("sheet"),
        white: token("sheet"),
        black: token("night"),
        rule: {
          DEFAULT: token("rule"),
          strong: token("rule-strong"),
        },
        night: {
          DEFAULT: token("night"),
          2: token("night-2"),
          line: token("night-line"),
          text: token("night-text"),
        },
        slate: neutral,
        gray: neutral,
        zinc: neutral,
        stone: neutral,
        neutral,
        emerald: green,
        green,
        teal: green,
        amber,
        orange: amber,
        yellow: amber,
        red,
        rose: red,
      },
      fontFamily: {
        sans: ["var(--sans)"],
        serif: ["var(--serif)"],
        mono: ["var(--mono)"],
      },
      borderRadius: {
        xs: "3px",
      },
      boxShadow: {
        "2xs": "0 1px 0 rgb(var(--ink-rgb) / 0.04)",
        xs: "0 1px 2px rgb(var(--ink-rgb) / 0.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        0.2: "0.05rem",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".outline-hidden": { outline: "2px solid transparent", "outline-offset": "2px" },
      });
    }),
  ],
};

export default config;
