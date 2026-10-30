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
         * Rampa grafite do tema escuro editorial. Levemente azulada em vez de
         * cinza puro — cinza neutro sobre preto fica sujo.
         */
        carbon: {
          50: "#f5f6f8",
          100: "#e6e8ed",
          200: "#c6cad5",
          300: "#99a0b0",
          400: "#838b9b",
          500: "#4b5260",
          600: "#343a46",
          700: "#252a34",
          800: "#191d25",
          850: "#13161c",
          900: "#0e1015",
          950: "#08090d"
        },
        /** Acento unico, usado com parcimonia. */
        brand: {
          50: "#eaf2ff",
          100: "#d4e5ff",
          200: "#adcdff",
          300: "#7cb0ff",
          400: "#4d9bff",
          500: "#0072ff",
          600: "#005ed6",
          700: "#004aa8"
        },
        live: "#ff3b30",
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
        /** Escala editorial: o nome domina, o resto sussurra. */
        hero: [
          "clamp(2.75rem, 1.2rem + 7vw, 8rem)",
          { lineHeight: "0.92", letterSpacing: "-0.045em", fontWeight: "800" }
        ],
        display: [
          "clamp(2rem, 1.2rem + 3.6vw, 4.25rem)",
          { lineHeight: "1.02", letterSpacing: "-0.038em", fontWeight: "700" }
        ],
        title: [
          "clamp(1.5rem, 1.1rem + 1.6vw, 2.25rem)",
          { lineHeight: "1.12", letterSpacing: "-0.028em", fontWeight: "700" }
        ],
        /** Rotulos pequenos em caixa alta, muito espacados. */
        eyebrow: [
          "0.6875rem",
          { lineHeight: "1", letterSpacing: "0.18em", fontWeight: "600" }
        ],
        lead: ["1.0625rem", { lineHeight: "1.65", letterSpacing: "-0.006em" }]
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        soft: "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      boxShadow: {
        /** Sobre fundo escuro, profundidade vem de luz e contorno, nao de sombra. */
        hair: "inset 0 0 0 1px rgba(255,255,255,0.07)",
        "hair-strong": "inset 0 0 0 1px rgba(255,255,255,0.13)",
        lift: "0 24px 60px -30px rgba(0,0,0,0.9)",
        "lift-lg": "0 48px 110px -50px rgba(0,0,0,1)",
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 90px -50px rgba(0,114,255,0.55)"
      },
      keyframes: {
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.72)" }
        },
        "ken-burns": {
          from: { transform: "scale(1.03)" },
          to: { transform: "scale(1.12)" }
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scroll-cue": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.35" },
          "50%": { transform: "translateY(5px)", opacity: "1" }
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "live-pulse": "live-pulse 1.8s ease-in-out infinite",
        "ken-burns": "ken-burns 26s ease-out forwards",
        "fade-in": "fade-in 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "scroll-cue": "scroll-cue 2s ease-in-out infinite",
        marquee: "marquee 38s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
