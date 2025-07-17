const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'], 
      },
      colors: {
        background: '#FDFBF6',
        primary: '#A67B5B',
        'primary-dark': '#8C6A4D',
        'primary-light': '#C08D6E',
        secondary: '#4A4A4A',
        accent: '#E6B89C',
        accentDark: '#D9A382',
        'accent-light': '#F2CBB5',
        text: '#333333',
        'text-light': '#555555',
        border: '#DDDDDD',
        success: '#5CB85C',
        warning: '#F0AD4E',
        error: '#D9534F',
        gray: colors.gray,
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'hard': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}