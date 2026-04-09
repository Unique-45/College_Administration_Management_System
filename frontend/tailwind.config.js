/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── App Backgrounds ──
        app: '#0B1220',
        'surface-1': '#111827',
        'surface-2': '#1F2937',
        'surface-3': '#243041',
        'border-app': '#334155',

        // ── Text ──
        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-muted': '#94A3B8',

        // ── Brand ──
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#DBEAFE',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
        },
        accent: {
          DEFAULT: '#14B8A6',
          hover: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F766E',
          700: '#115E59',
        },

        // ── Status ──
        success: {
          DEFAULT: '#22C55E',
          soft: '#DCFCE7',
          text: '#166534',
        },
        warning: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
          text: '#92400E',
        },
        danger: {
          DEFAULT: '#EF4444',
          soft: '#FEE2E2',
          text: '#991B1B',
        },
        info: {
          DEFAULT: '#38BDF8',
          soft: '#E0F2FE',
          text: '#075985',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '18px',
        'input': '12px',
        'btn': '12px',
        'pill': '9999px',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'glow-primary': '0 0 20px rgba(37, 99, 235, 0.15)',
        'glow-accent': '0 0 20px rgba(20, 184, 166, 0.15)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
        'gradient-surface': 'linear-gradient(180deg, #111827 0%, #0B1220 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
