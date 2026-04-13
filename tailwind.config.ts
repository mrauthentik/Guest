import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf9',
          100: '#ccfbee',
          200: '#99f5dd',
          300: '#5eeac7',
          400: '#2dd6ae',
          500: '#10bc96',
          600: '#079679',
          700: '#077864',
          800: '#095f50',
          900: '#0a4f43',
          950: '#042e28',
        },
        gold: {
          50:  '#fffceb',
          100: '#fff5c6',
          200: '#ffe989',
          300: '#ffd540',
          400: '#f0b429',
          500: '#e9a010',
          600: '#cc7a06',
          700: '#a35509',
          800: '#86420e',
          900: '#713713',
        },
        dark: {
          950: '#020207',
          900: '#08080f',
          800: '#0d0d1a',
          700: '#131325',
          600: '#1c1c35',
          500: '#252545',
          400: '#2e2e58',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono:   ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':        'fadeIn 0.6s ease-out forwards',
        'fade-up':        'fadeUp 0.7s ease-out forwards',
        'slide-in-left':  'slideInLeft 0.7s ease-out forwards',
        'slide-in-right': 'slideInRight 0.7s ease-out forwards',
        'float':          'float 6s ease-in-out infinite',
        'pulse-slow':     'pulse 4s ease-in-out infinite',
        'shimmer':        'shimmer 2.5s linear infinite',
        'spin-slow':      'spin 20s linear infinite',
        'glow':           'glow 2s ease-in-out infinite alternate',
        'typewriter':     'typewriter 3s steps(30) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(16,188,150,0.3), 0 0 20px rgba(16,188,150,0.1)' },
          to:   { boxShadow: '0 0 20px rgba(16,188,150,0.6), 0 0 40px rgba(16,188,150,0.2)' },
        },
        typewriter: {
          '0%':   { width: '0' },
          '100%': { width: '100%' },
        },
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient':     'radial-gradient(at 40% 20%, hsla(160,100%,40%,0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.05) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}

export default config
