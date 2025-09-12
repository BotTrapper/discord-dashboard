/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This enables class-based dark mode
  theme: {
    extend: {
      colors: {
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          white: '#FFFFFF',
          gray: {
            100: '#F2F3F5',
            200: '#E3E5E8',
            300: '#D1D5DB',
            400: '#B9BCC8',
            500: '#A1A5B7',
            600: '#8E9297',
            700: '#6D6F78',
            800: '#4F545C',
            900: '#36393F',
            950: '#2F3136'
          }
        }
      },
      fontFamily: {
        'discord': ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}