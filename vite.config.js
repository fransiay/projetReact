import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Toute requête front vers /api est redirigée vers le backend Express.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
