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
        proxlive: {
          blue: "#0072ff",
          navy: "#081f3d"
        }
      },
      boxShadow: {
        soft: "0 18px 48px -30px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
