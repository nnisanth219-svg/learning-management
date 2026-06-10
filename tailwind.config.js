/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFBFF',
        'canvas-muted': '#F5F7FF',
        'canvas-deep': '#EEF2FF',
        surface: '#FFFFFF',
        foreground: '#0F172A',
        muted: '#64748B',
        border: '#E2E8F0',
        subtle: '#F1F5F9',
        primary: {
          DEFAULT: '#1E40AF',
          foreground: '#FFFFFF',
          soft: '#DBEAFE',
          light: '#3B82F6',
        },
        secondary: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
          soft: '#EEF2FF',
        },
        accent: {
          DEFAULT: '#7C3AED',
          foreground: '#FFFFFF',
          soft: '#F3E8FF',
        },
        success: { DEFAULT: '#10B981', soft: '#ECFDF5', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#F59E0B', soft: '#FFFBEB' },
        danger: { DEFAULT: '#EF4444', soft: '#FEF2F2' },
      },
      borderRadius: {
        DEFAULT: '12px',
        card: '16px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(30, 58, 138, 0.05)',
        sm: '0 2px 8px rgba(30, 58, 138, 0.06)',
        card: '0 4px 24px rgba(30, 58, 138, 0.08)',
        premium: '0 8px 32px rgba(30, 58, 138, 0.12)',
        glow: '0 0 40px rgba(79, 70, 229, 0.15)',
        glass: '0 8px 32px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '800' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #1E40AF 0%, #4F46E5 50%, #7C3AED 100%)',
        'soft-gradient': 'linear-gradient(180deg, #FAFBFF 0%, #EEF2FF 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(238,242,255,0.6) 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
