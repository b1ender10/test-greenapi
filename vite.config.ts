import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/** Dev proxy: /api/proxy → GREEN-API (host/path from headers) */
function greenApiProxy(): Plugin {
  return {
    name: 'green-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        const hostHeader = req.headers['x-green-api-host']
        const pathHeader = req.headers['x-green-api-path']
        const host = (Array.isArray(hostHeader) ? hostHeader[0] : hostHeader) || 'api.green-api.com'
        const path = Array.isArray(pathHeader) ? pathHeader[0] : pathHeader

        if (!path || !path.startsWith('/')) {
          res.statusCode = 400
          res.end('Invalid path')
          return
        }
        if (!/^[a-z0-9.-]+$/i.test(host)) {
          res.statusCode = 400
          res.end('Invalid host')
          return
        }

        try {
          const target = `https://${host}${path}`
          const headers: Record<string, string> = {}
          if (req.headers['content-type']) {
            headers['Content-Type'] = String(req.headers['content-type'])
          }

          const init: RequestInit = { method: req.method || 'GET', headers }
          if (req.method && !['GET', 'HEAD'].includes(req.method)) {
            init.body = await readBody(req)
          }

          const upstream = await fetch(target, init)
          const buf = Buffer.from(await upstream.arrayBuffer())
          res.statusCode = upstream.status
          const ct = upstream.headers.get('content-type')
          if (ct) res.setHeader('Content-Type', ct)
          res.end(buf)
        } catch (err) {
          res.statusCode = 502
          res.end(err instanceof Error ? err.message : 'Proxy error')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), greenApiProxy()],
})
