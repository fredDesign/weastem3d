import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  // Dans Tailwind V4, la plupart de la configuration se fait via CSS
  // Gardons une configuration minimale ici
} satisfies Config