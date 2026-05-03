import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#04342C",
        secondary: "#F5F0E8",
        accent:    "#C8A951",
        success:   "#2D7A4F",
        warning:   "#E07B39",
        ink:       "#1A1A1A",
      },
      fontFamily: {
        // CSS variable injected by next/font in layout.tsx
        heading:    ["var(--font-playfair)", "Georgia", "serif"],
        body:       ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        // Aliases used by shared UI components
        "body-medium": ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        "body-bold":   ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      minHeight: {
        "button-sm": "48px",
        "button-md": "56px",
        "button-lg": "64px",
      },
    },
  },
  plugins: [],
};

export default config;
