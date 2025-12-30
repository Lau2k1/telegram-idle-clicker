import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'telegram-idle-clicker-production.up.railway.app',
    ],
  },
  preview: {
    allowedHosts: [
      'telegram-idle-clicker-production.up.railway.app',
    ],
  },
})
