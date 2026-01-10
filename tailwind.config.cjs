/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1e3a8a", // Deep Blue from FlowHR
          teal: "#14b8a6", // Teal from logo
          bg: "#f8fafc",   // Light slate background
        },
      },
    },
  },
  plugins: [],
});
