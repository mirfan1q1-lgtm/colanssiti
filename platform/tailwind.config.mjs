/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        atelier: {
          50: '#FDFBF7',
          100: '#F9F5EE',
          200: '#F0E8D9',
          300: '#E4D5BC',
          400: '#CDB996',
          500: '#B89F75',
          600: '#9B7E55',
          700: '#7B603D',
          800: '#5A4328',
          900: '#3A2916',
        },
        navy: {
          DEFAULT: '#0B1730',
          2: '#162850',
          3: '#1E356A',
        },
        gold: {
          DEFAULT: '#C8A45D',
          2: '#E6CF9C',
          d: '#9A7836',
        },
        maroon: {
          DEFAULT: '#7A1F2B',
          d: '#5E1622',
          dd: '#3A0D15',
          rose: '#FBE8E9',
        },
        stone: {
          850: '#211D1A',
          900: '#1A1715',
          950: '#12100E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

