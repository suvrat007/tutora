const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'], 
      },
      colors: {
        primary: '#123456',
        gray: colors.gray,
      },
    },
  },
  plugins: [],
}
