import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: "#000000",
          white: "#ffffff",
          gray100: "#f6f6f6",
          gray200: "#eeeeee",
          gray300: "#e2e2e2",
          gray400: "#afafaf",
          gray500: "#5e5e5e",
          gray600: "#4b4b4b",
          gray800: "#1e1e1e",
          gray900: "#121212",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0, 0, 0, 0.06)",
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
        elevated: "0 12px 32px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
