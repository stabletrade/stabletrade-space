import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundColor: {
        primary: '#1DE9B6',
        gray: 'rgba(0, 0, 0, 0.19)',
        'blue-200': '#f2f6ff',
        'blue-300': '#141a36',
        'blue-400': '#9eb7fe',
        'blue-500': '#1854ce',
        lightskyblue: '#b0c5ff',
      },
      borderColor: {
        stroke: '#212e52',
        divider: '#212e52',
        focus: '#341CFF',
      },
      colors: {
        primary: '#fff',
        secondary: '#798AD0',
        success: '#19AD41',
        error: '#e42051',
        'blue-500': '#1854ce',
        'neural-900': '#1d1754',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
      },
    },
  },
  plugins: [],
};
export default config;
