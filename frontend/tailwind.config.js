/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B1121",
        surface: "#1A2332",
        primary: "#10B981",
        "primary-glow": "rgba(16, 185, 129, 0.15)",
        secondary: "#38BDF8",
        warning: "#F59E0B",
        danger: "#EF4444",
        text: "#FFFFFF",
        "text-secondary": "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(16, 185, 129, 0.15), 0 0 40px rgba(16, 185, 129, 0.05)",
        "glow-lg": "0 0 30px rgba(16, 185, 129, 0.2), 0 0 60px rgba(16, 185, 129, 0.08)",
        card: "0 0 0 1px rgba(255,255,255,0.03), 0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.1)",
        "card-hover": "0 0 0 1px rgba(16, 185, 129, 0.1), 0 4px 8px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
