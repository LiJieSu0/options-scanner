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
        background: "#0f0f23",
        card: "#1a1a2e",
        primary: "#6366f1",
        border: "#334155",
        "text-primary": "#e2e8f0",
        "text-secondary": "#94a3b8",
        danger: "#ef4444",
        success: "#22c55e",
      },
    },
  },
  plugins: [],
};
export default config;
