/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rifa: {
          bg: '#FFF5F9',
          fucsia: '#D6336C',
          fucsiaLight: '#EC4899',
          fucsiaDark: '#A61E4D',
          lavanda: '#9B5DE5',
          lavandaLight: '#C4A6F0',
          rosaPastel: '#FBD1E4',
          dorado: '#E8B84B',
        },
        estado: {
          disponible: '#F3E8EF',
          disponibleBorder: '#E3C9DA',
          reservado: '#F5A524',
          reservadoBg: '#FFF1D6',
          pagado: '#2E9E5B',
          pagadoBg: '#DFF6E7',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(214, 51, 108, 0.12)',
      },
    },
  },
  plugins: [],
}
