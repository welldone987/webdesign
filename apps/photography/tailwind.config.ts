import type { Config } from 'tailwindcss';

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
        theme: {
          apricity: {
            accent: '#C99567',
            soft: '#EBD7BF',
          },
          azure: {
            accent: '#7F9FB0',
            soft: '#D7E4E9',
          },
          lush: {
            accent: '#8F9F76',
            soft: '#DEE7D2',
          },
          pall: {
            accent: '#8F8B84',
            soft: '#E0DDD7',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
