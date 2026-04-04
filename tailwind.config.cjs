/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        base: "#0F172A",
        card: "#1E293B",
        primary: "#4F46E5",
        accent: "#22C55E"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.45)",
        glow: "0 0 30px rgba(79, 70, 229, 0.35)"
      },
      borderRadius: {
        xl: "16px"
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "ring-pulse": "ringPulse 1.6s ease-in-out infinite",
        "pop-in": "popIn 0.35s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        ringPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.03)", opacity: "1" }
        },
        popIn: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
