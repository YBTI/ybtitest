/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // React用の監視対象
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        pastelPink: "#ffe4e6",
        pastelBlue: "#e0f2fe",
        pastelGreen: "#dcfce7",
        pastelYellow: "#fef9c3",
      },
    },
  },
  plugins: [],
};
