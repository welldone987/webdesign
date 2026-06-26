/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        porcelain: '#f8f5ef',
        paper: '#eee7dc',
        ink: '#1c1b18',
        umber: '#8f7763',
        moss: '#6f776a',
      },
    },
  },
  plugins: [],
};
