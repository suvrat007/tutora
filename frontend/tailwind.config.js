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
        primary: '#123456',
        gray: colors.gray,
      },
    },
  },
  plugins: [],
}
