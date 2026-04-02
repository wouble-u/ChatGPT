/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      tablet: '480px',
    },
    extend: {
      colors: {
        'app-gray-1': '#171717',
        'app-gray-2': '#212121',
        'app-gray-3': '#2f2f2f',
        'app-active': '#10a37f',
        // DNAchain Synergy Drive colors
        'dna-bg': '#0a0a0f',
        'dna-card': '#12121a',
        'dna-border': '#1f1f2e',
        'dna-accent': '#00ff88',
        'dna-accent-dim': '#00cc6a',
        'dna-purple': '#8b5cf6',
        'dna-cyan': '#06b6d4',
        'dna-warning': '#f59e0b',
        'dna-danger': '#ef4444',
        'dna-text': '#e4e4e7',
        'dna-text-dim': '#71717a',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'score-pop': 'score-pop 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
        'score-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('autoprefixer'),
  ],
}
