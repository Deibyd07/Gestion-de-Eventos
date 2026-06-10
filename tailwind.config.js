import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Poppins como fuente por defecto en toda la app (sobreescribe sans)
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Righteous', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Sistema de diseño EventHub (skill ui-ux-pro-max) ──
        // Remapeo global de marca: las pantallas antiguas usaban blue/indigo
        // como color primario; ahora apuntan al violeta de la nueva identidad.
        // Así los 127 archivos se reskins sin tocar su JSX.
        blue: colors.violet,
        indigo: colors.violet,
        // 'purple' se mantiene como Tailwind por defecto: ya es de marca y los
        // componentes nuevos (Home, Login) usan purple-50/950 intencionalmente.
        // Acento de marca (naranja) disponible como token semántico.
        brand: colors.violet,
        accent: colors.orange,
      },
      animation: {
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
  plugins: [],
};
