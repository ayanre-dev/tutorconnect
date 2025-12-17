import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'global': 'window',
    'process.env': {}
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process',
      stream: 'stream-browserify',
      util: 'util',
      events: 'events',
    }
  },
  server: {
    port: 5173,
    cors: true
  }
})
