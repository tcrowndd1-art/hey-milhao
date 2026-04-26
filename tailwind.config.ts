import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.{md,mdx}"],
  theme: {
    extend: {
      colors: {
        page: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--bg-soft) / <alpha-value>)",
        line: "rgb(var(--border) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          soft: "rgb(var(--text-soft) / <alpha-value>)",
          mute: "rgb(var(--text-mute) / <alpha-value>)",
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "rgb(var(--brand) / <alpha-value>)",
          600: "rgb(var(--brand-hover) / <alpha-value>)",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Pretendard",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        prose: "44rem",
        content: "48rem",
      },
      transitionProperty: {
        colors:
          "color, background-color, border-color, text-decoration-color, fill, stroke",
      },
    },
  },
  plugins: [typography],
};

export default config;
