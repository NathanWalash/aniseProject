/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./App.{js,ts,tsx}", "./src/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5faff',
          100: '#e0f1ff',
          500: '#0066cc',  // your primary
          700: '#004ba0',
        },
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,0.1)',
      }
    },
  },
};