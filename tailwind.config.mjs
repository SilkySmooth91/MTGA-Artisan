/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'background': 'var(--color-background)',
        'primary': 'var(--color-primary)', 
        'text': 'var(--color-text)'
      },
      fontFamily: {
        'heading': ['Anton', 'sans-serif'],
        'body': ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}