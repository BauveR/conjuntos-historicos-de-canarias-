import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
