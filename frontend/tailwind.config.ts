import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        theme: "#1e1e1e",
        accent: "#6366f1",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
        primary: "#f1f5f9",
        muted: "#64748b",
      },
      backgroundColor: {
        background: "#0a0a0a",
        surface: "#111111",
      },
      textColor: {
        primary: "#f1f5f9",
        muted: "#64748b",
      },
      borderColor: {
        theme: "#1e1e1e",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
