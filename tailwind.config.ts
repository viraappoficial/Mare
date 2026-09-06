import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2F3E46",
        sage: {
          DEFAULT: "#52796F",
          light: "#8AA69C",
          dark: "#3F5F55",
        },
        mist: "#CAD2C5",
        cream: "#F6F8F7",
        peach: {
          DEFAULT: "#F4D6CC",
          dark: "#E8B8A8",
        },
        gold: {
          DEFAULT: "#E9C46A",
          dark: "#D9A73B",
        },
        fill: {
          you: "#F4D6CC",
          auto: "#CAD2C5",
          goal: "#E9C46A",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 2px 16px -4px rgba(47, 62, 70, 0.08)",
        cardHover: "0 6px 24px -6px rgba(47, 62, 70, 0.14)",
      },
      maxWidth: {
        app: "1200px",
        screen: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
