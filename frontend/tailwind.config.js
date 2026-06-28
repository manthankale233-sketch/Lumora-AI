/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          deep: "#05030A",
          card: "#0C091A",
          border: "#1E1A33",
          hover: "#252040",
          text: "#E2E8F0",
          muted: "#94A3B8",
        },
        brand: {
          violet: "#8B5CF6",
          purple: "#7C3AED",
          pink: "#EC4899",
          blue: "#3B82F6",
          indigo: "#6366F1",
          emerald: "#10B981",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      }
    },
  },
  plugins: [],
}
