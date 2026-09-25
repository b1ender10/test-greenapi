import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.green-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        timeout: 70_000,
        proxyTimeout: 70_000,
        router: (req: IncomingMessage) => {
          const host = req.headers['x-green-api-host']
          const value = Array.isArray(host) ? host[0] : host
          return value ? `https://${value}` : 'https://api.green-api.com'
        },
      },
    },
  },
})
