/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        cardbg: 'rgba(17, 24, 39, 0.7)',
        cardborder: 'rgba(255, 255, 255, 0.08)',
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        status: {
          available: '#10b981',       // Emerald
          allocated: '#3b82f6',       // Blue
          reserved: '#8b5cf6',        // Purple
          maintenance: '#f59e0b',     // Amber
          lost: '#ef4444',            // Rose
          retired: '#6b7280',         // Gray
          disposed: '#4b5563',        // Dark Gray
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 20px 2px rgba(139, 92, 246, 0.15)',
      },
      backdropFilter: {
        'glass': 'blur(12px)',
      }
    },
  },
  plugins: [],
}
