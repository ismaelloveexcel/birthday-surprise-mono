/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#ec4899",
          "pink-light": "#fce7f3",
          neon: "#a855f7",
          gold: "#be123c",
        },
      },
    },
  },
  plugins: [],
};
