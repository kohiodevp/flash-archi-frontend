/** @type {import('tailwindcss').Config} */
// =============================================================
// Flash-Archi Frontend — Palette de marque + typographie
//
//  Inspirée de l'architecture : bleu profond (bâti / structure),
//  blanc (lumière, espace), accents orange (chantier / signal).
//  Typographie : Inter (interface) + Poppins (titres).
// =============================================================
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Bleu profond (primaire)
          50:  '#eef4fb',
          100: '#d8e6f5',
          200: '#b3cde9',
          300: '#87abda',
          400: '#5f8bd0',
          500: '#3d6cc2',
          600: '#2e53a4', // bleu principal
          700: '#274487',
          800: '#1f366e',
          900: '#182b58', // bleu profond
          950: '#0f1c3d',
        },
        accent: {
          // Orange chantier (actions / CTA)
          400: '#ffa94d',
          500: '#ff8c1a',
          600: '#f57200', // orange principal
          700: '#cc5f00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}