/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        surface: "#F3EEE5",
        journal: {
          bg: "#F7F3EC",
          panel: "#FFFDF8",
          accent: "#C9732C",
          ink: "#2F241C",
          muted: "#7A6655",
          border: "rgba(122, 102, 85, 0.22)",
          beige: "#F1E4D2",
          clay: "#A75B28",
        },
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, rgba(201,115,44,0.18), rgba(167,91,40,0.28))",
      },
      boxShadow: {
        glass: "0 20px 40px rgba(74, 52, 36, 0.18)",
      },
    },
  },
  plugins: [],
};
