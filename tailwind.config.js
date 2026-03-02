/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#00E5A0', dark: '#00B87D' },
        accent: '#7C3AED',
        surface: { DEFAULT: '#0A0A0F', 1: '#111118', 2: '#18181F', 3: '#1F1F28', 4: '#26262F' },
        border: '#2A2A35',
      },
    },
  },
  plugins: [],
}
