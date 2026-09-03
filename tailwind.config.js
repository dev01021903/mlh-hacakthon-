/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amrit: {
          bg: '#F6FAFC',
          card: '#FFFFFF',
          navy: '#102A43',
          navyLight: '#1F3E5D',
          text: '#172B4D',
          muted: '#61758A',
          teal: '#0F8B8D',
          tealDark: '#0B6A6C',
          tealLight: '#E6F7F7',
          blue: '#247BFE',
          blueLight: '#EDF4FF',
          cyan: '#DFF7FA',
          border: '#DCE8F0',
          borderLight: '#EDF3F7',
          safe: '#1AAE72',
          safeLight: '#E8F7F0',
          consult: '#F4A340',
          consultLight: '#FEF6EC',
          emergency: '#E95757',
          emergencyLight: '#FDECEC',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(16, 42, 67, 0.05), 0 2px 6px -1px rgba(16, 42, 67, 0.03)',
        'card': '0 10px 30px -4px rgba(16, 42, 67, 0.07), 0 4px 12px -2px rgba(16, 42, 67, 0.04)',
        'card-hover': '0 20px 35px -5px rgba(16, 42, 67, 0.1), 0 8px 16px -4px rgba(16, 42, 67, 0.06)',
        'glow-teal': '0 0 25px -3px rgba(15, 139, 141, 0.3)',
      },
      borderRadius: {
        'card-sm': '18px',
        'card': '22px',
        'card-lg': '28px',
      }
    },
  },
  plugins: [],
}
