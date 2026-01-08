import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0a0a0a",
          foreground: "#fafafa",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#0a0a0a",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#0a0a0a",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
