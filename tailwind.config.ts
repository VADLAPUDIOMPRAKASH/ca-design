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
        // Eye-friendly: muted teal (less harsh than blue for long viewing)
        primary: {
          DEFAULT: "#0D9488",
          hover: "#0F766E",
          light: "#CCFBF1",
        },
        secondary: {
          DEFAULT: "#6B7280",
          hover: "#4B5563",
        },
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",
        // Warm off-white backgrounds reduce glare
        background: "#F7F6F2",
        surface: "#FDFCFA",
        white: "#FFFFFF",
        // Softer text colors
        "text-primary": "#3F3F3F",
        "text-muted": "#6B7280",
        // Soft borders
        border: "#E8E6E1",
        // Subtle surfaces (replaces harsh gray-50)
        "surface-subtle": "#F3F2EE",
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
        "xl": "12px",
        "2xl": "16px",
      },
      boxShadow: {
        "soft": "0 1px 3px rgba(63, 63, 63, 0.06)",
        "card": "0 2px 8px rgba(63, 63, 63, 0.04)",
        "elevated": "0 4px 16px rgba(63, 63, 63, 0.06)",
      },
      lineHeight: {
        "relaxed": "1.65",
        "reading": "1.7",
      },
      transitionDuration: {
        "comfort": "200ms",
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};
export default config;
