import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        secondary: {
          DEFAULT: "#64748b",
          hover: "#475569",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        background: "#f8fafc",
        white: "#ffffff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "Poppins", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      borderRadius: {
        "button": "6px",
        "card": "8px",
      },
    },
  },
  plugins: [],
};
export default config;
