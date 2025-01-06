/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neonPink: '#ff0077',
        neonBlue: '#00eaff',
        neonPurple: '#a500ff',
      },
      boxShadow: {
        neon: '0 0 8px rgba(255, 0, 255, 0.6), 0 0 12px rgba(0, 255, 255, 0.4)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      }
    },
  },
  darkMode: 'class',
  plugins: [],
};
