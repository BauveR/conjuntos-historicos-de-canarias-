import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      // Allows Firebase signInWithPopup to communicate with the OAuth popup
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
