/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
};