import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss({
      config: './tailwind.config.js',
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    }),
    autoprefixer(),
  ],
}
