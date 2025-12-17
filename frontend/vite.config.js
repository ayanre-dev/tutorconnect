import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'window',
    'process.env': {}
  },
  server: {
    port: 5173,
    cors: true
  }
})
