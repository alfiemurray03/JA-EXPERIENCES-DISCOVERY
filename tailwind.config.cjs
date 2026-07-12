/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./functions/**/*.{js,html}",
    "./scripts/**/*.{js,mjs}",
    "./tests/**/*.{js,mjs}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f8fafc",
        surface: "#ffffff",
        ink: "#0f172a",
        muted: "#64748b",
        line: "#e2e8f0",
        primary: "#2563eb",
        "primary-soft": "#eff6ff"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,.06)",
        panel: "0 8px 24px -8px rgba(15,23,42,.14)"
      }
    }
  },
  plugins: []
};
