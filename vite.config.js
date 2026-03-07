import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  // Set base to the repo name so asset paths are correct on GitHub Pages.
  // e.g. https://clova-cz.github.io/Activity-Monitor/
  base: '/Activity-Monitor/',
  plugins: [svelte()],
})
