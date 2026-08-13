import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Escala neutra fria unica do projeto. Substitui a mistura anterior de
         * `neutral-*` (cinza puro), `#111827` e tons soltos — cinza puro ao lado
         * de azul deixava a interface com aparencia remendada.
         */
        ink: {
          50: "#f6f8fb",
          100: "#eef1f7",
          200: "#dee4ef",
          300: "#c4cddf",
          400: "#909db8",
          500: "#65728d",
          600: "#4b566e",
          700: "#374156",
          800: "#1f2940",
          900: "#131c2e",
          950: "#0a1120"
        },
        /** Azul da marca. O 500 e o #0072ff original. */
        brand: {
          50: "#eaf2ff",
          100: "#d4e5ff",
          200: "#adcdff",
          300: "#7cb0ff",
          400: "#4d9bff",
          500: "#0072ff",
          600: "#005ed6",
          700: "#004aa8",
          800: "#003b85",
          900: "#002a5e"
        },
        proxlive: {
          blue: "#0072ff",
          "blue-soft": "#4d9bff",
          navy: "#081f3d",
          live: "#ff3b30"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        // Titulos grandes precisam de tracking negativo para nao parecerem soltos.
        display: [
          "clamp(1.85rem, 1.15rem + 2.6vw, 3rem)",
          { lineHeight: "1.08", letterSpacing: "-0.032em", fontWeight: "700" }
        ],
        title: [
          "clamp(1.45rem, 1.1rem + 1.4vw, 2.1rem)",
          { lineHeight: "1.15", letterSpacing: "-0.026em", fontWeight: "700" }
        ],
        lead: ["1.0625rem", { lineHeight: "1.65", letterSpacing: "-0.006em" }]
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "soft": "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      boxShadow: {
        // Elevacao em 4 niveis, com sombra levemente azulada em vez de preto puro.
        e1: "0 1px 2px rgba(10,17,32,0.04), 0 1px 3px rgba(10,17,32,0.06)",
        e2: "0 2px 4px rgba(10,17,32,0.04), 0 8px 18px -8px rgba(10,17,32,0.12)",
        e3: "0 4px 8px -2px rgba(10,17,32,0.06), 0 18px 34px -14px rgba(10,17,32,0.18)",
        e4: "0 8px 18px -6px rgba(10,17,32,0.10), 0 34px 60px -24px rgba(10,17,32,0.28)",
        "e3-brand":
          "0 4px 8px -2px rgba(0,114,255,0.10), 0 18px 38px -16px rgba(0,114,255,0.42)",
        "inset-hair": "inset 0 0 0 1px rgba(255,255,255,0.08)"
      },
      keyframes: {
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.78)" }
        },
        "ken-burns": {
          from: { transform: "scale(1.02)" },
          to: { transform: "scale(1.09)" }
        },
        "slide-progress": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" }
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        }
      },
      animation: {
        "live-pulse": "live-pulse 1.7s ease-in-out infinite",
        "ken-burns": "ken-burns 14s ease-out forwards",
        shimmer: "shimmer 1.9s infinite",
        "fade-in": "fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
