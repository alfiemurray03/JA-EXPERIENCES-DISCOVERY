/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/assets/js/*.js",
    "./public/assets/includes/*.html",
    "./src/worker.js",
    "./functions/**/*.js"
  ],
  darkMode: ["class", '[data-site-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary) / 0.16)",
          soft: "hsl(var(--primary) / 0.08)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(142 71% 45%)",
          soft: "hsl(142 71% 45% / 0.08)",
        },
        warning: {
          DEFAULT: "hsl(38 92% 50%)",
          soft: "hsl(38 92% 50% / 0.08)",
        },
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#7d8fa9",
          500: "#5e7086",
          600: "#475569",
          700: "#364152",
          800: "#273344",
          900: "#1a2332",
          950: "#0f1620",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        heading: ['"Segoe UI"', "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Monaco", "Cascadia Code", "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      boxShadow: {
        sm: "0 2px 8px -1px hsl(221 83% 53% / 0.10), 0 1px 3px -1px hsl(0 0% 0% / 0.06)",
        DEFAULT: "0 4px 16px -2px hsl(221 83% 53% / 0.12), 0 2px 6px -1px hsl(0 0% 0% / 0.06)",
        md: "0 8px 24px -4px hsl(221 83% 53% / 0.14), 0 4px 8px -2px hsl(0 0% 0% / 0.08)",
        lg: "0 16px 40px -8px hsl(221 83% 53% / 0.16), 0 8px 16px -6px hsl(0 0% 0% / 0.08)",
        xl: "0 24px 56px -12px hsl(221 83% 53% / 0.20), 0 12px 24px -8px hsl(0 0% 0% / 0.10)",
        glow: "0 0 20px hsl(221 83% 53% / 0.25)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, hsl(221 83% 53%), hsl(217 91% 60%))",
        "gradient-hero": "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(214 32% 95%) 100%)",
      },
      maxWidth: {
        content: "1200px",
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
      },
    },
  },
  plugins: [],
};
