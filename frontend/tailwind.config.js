const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure content paths are correct
  ],
  theme: {
    extend: {
      colors: {
        primary: '#123456',
        // ✅ Add only what you need, but retain all default colors
        gray: colors.gray,
      },
    },
  },
  plugins: [],
}
