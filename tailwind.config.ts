// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d1117',
        surface: '#161b22',
        accent: { DEFAULT: '#1f6feb', hover: '#388bfd' },
        success: '#2ea043',
        warning: '#d29922',
        muted: '#484f58',
        'text-primary': '#e6edf3',
        'text-muted': '#8b949e',
        border: '#30363d',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
          'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Noto Sans JP',
          'Meiryo', 'system-ui', 'sans-serif',
        ],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
