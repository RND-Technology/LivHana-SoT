import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Empire Empire Brand Colors
        texas: {
          blue: '#003F87',
          red: '#BF0A30',
          white: '#FFFFFF'
        },
        hemp: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#4CAF50', // Primary hemp green
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16'
        },
        liberty: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFB81C', // Liberty gold
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03'
        },
        // LivHana Existing Colors (from vibe-cockpit)
        livhana: {
          primary: '#16A34A',
          secondary: '#F59E0B',
          dark: '#0F172A',
          light: '#F8FAFC'
        },
        // Gamification Colors
        xp: {
          bg: '#4ADE80',
          bar: '#10B981',
          glow: '#34D399'
        },
        rank: {
          seedling: '#10B981',
          cultivator: '#3B82F6',
          farmer: '#8B5CF6',
          rider: '#F59E0B'
        }
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'starfield': 'starfield 100s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 8s linear infinite'
      },
      keyframes: {
        starfield: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100vh)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(74, 222, 128, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(74, 222, 128, 1)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      backgroundImage: {
        'texas-gradient': 'linear-gradient(135deg, #003F87 0%, #BF0A30 100%)',
        'hemp-gradient': 'linear-gradient(135deg, #4CAF50 0%, #16A34A 100%)',
        'liberty-gradient': 'linear-gradient(135deg, #FFB81C 0%, #D97706 100%)',
        'starfield': 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent), radial-gradient(1px 1px at 33% 80%, white, transparent)'
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(74, 222, 128, 0.6)',
        'glow-gold': '0 0 20px rgba(255, 184, 28, 0.6)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.6)'
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config

// Optimized: 2025-10-02
