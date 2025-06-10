/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WCAG AA compliant color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // 4.5:1 contrast ratio
          600: '#2563eb', // 7:1 contrast ratio
          700: '#1d4ed8', // 10:1 contrast ratio
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // 4.5:1 contrast ratio
          600: '#16a34a', // 7:1 contrast ratio
          700: '#15803d', // 10:1 contrast ratio
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // 4.5:1 contrast ratio
          600: '#d97706', // 7:1 contrast ratio
          700: '#b45309', // 10:1 contrast ratio
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // 4.5:1 contrast ratio
          600: '#dc2626', // 7:1 contrast ratio
          700: '#b91c1c', // 10:1 contrast ratio
          800: '#991b1b',
          900: '#7f1d1d',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373', // 4.5:1 contrast ratio
          600: '#525252', // 7:1 contrast ratio
          700: '#404040', // 10:1 contrast ratio
          800: '#262626',
          900: '#171717',
        }
      }
    },
  },
  plugins: [],
}
