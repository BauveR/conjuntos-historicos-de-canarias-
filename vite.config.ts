import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // maplibre-gl v6 is ESM-only and loads its web worker via import.meta.url;
  // pre-bundling it breaks that worker (style never finishes loading).
  optimizeDeps: {
    exclude: ['maplibre-gl', '@maplibre/maplibre-gl-leaflet'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    environmentOptions: {
      jsdom: { url: 'http://localhost' },
    },
  },
  server: {
    headers: {
      // Allows Firebase signInWithPopup to communicate with the OAuth popup
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
