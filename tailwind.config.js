/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          navy:     '#1B2A4A',
          navyDark: '#152038',
          navyCard: '#243356',
          gold:     '#F5A623',
          goldHover:'#E09518',
          cream:    '#F0EDE6',
          creamDark:'#E5E0D5',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'slideInRight': 'slideInRight 0.6s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,166,35,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(245,166,35,0)' },
        },
      },
    },
  },
  plugins: [],
}