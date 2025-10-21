/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8',   // blue-700
        },
        success: {
          DEFAULT: '#16a34a', // green-600
          hover: '#15803d',   // green-700
        },
        warning: {
          DEFAULT: '#eab308', // yellow-500
          hover: '#ca8a04',   // yellow-600
        },
        danger: {
          DEFAULT: '#dc2626', // red-600
          hover: '#b91c1c',   // red-700
        },
      },
    },
  },
  plugins: [],
}
