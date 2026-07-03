import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#3f3934",
        cream: "#fffaf3",
        peach: {
          50: "#fff8f3",
          100: "#fbece2",
          200: "#f5d6c2",
          300: "#eeb99a",
          500: "#cb7651",
          700: "#8b4930"
        },
        sage: {
          50: "#f4f7f1",
          100: "#e7eee1",
          300: "#b8c8a8",
          500: "#7e9970",
          700: "#53664b"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(104, 78, 55, 0.09)",
      },
      borderRadius: {
        "4xl": "2rem",
      }
    },
  },
  plugins: [],
} satisfies Config;
