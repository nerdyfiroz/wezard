import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#090C10",
          light: "#0E131C",
          lighter: "#141C2A",
        },
        fintech: {
          green: "#10B981",
          "green-hover": "#059669",
          "green-glow": "rgba(16, 185, 129, 0.25)",
          dark: "#0C131D",
          card: "#121A28",
          border: "rgba(255, 255, 255, 0.08)",
          subtext: "#8E9BAE",
        },
        arcane: {
          purple: "#8B5CF6",
          cyan: "#06B6D4",
          gold: "#F59E0B",
          "gold-light": "#FDE68A",
          "gold-dark": "#D97706",
          pink: "#EC4899",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 3s infinite ease-in-out",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.4", filter: "drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))" },
          "50%": { opacity: "0.8", filter: "drop-shadow(0 0 25px rgba(253, 230, 138, 0.6))" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
