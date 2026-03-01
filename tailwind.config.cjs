/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",   // Blue-600
          primaryHover: "#1D4ED8", // Blue-700
          secondary: "#64748B", // Slate-500
          bg: "#F8FAFC",        // Slate-50
          border: "#E2E8F0",    // Slate-200
          surface: "#FFFFFF",
          success: "#10B981",   // Emerald-500
          danger: "#EF4444",    // Red-500
          warning: "#F59E0B",   // Amber-500
        },
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(0,0,0,0.06)',
        'soft-sm': '0 4px 12px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
});
