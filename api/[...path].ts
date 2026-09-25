import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hostHeader = req.headers['x-green-api-host']
  const host = (Array.isArray(hostHeader) ? hostHeader[0] : hostHeader) || 'api.green-api.com'
  if (!/^[a-z0-9.-]+$/i.test(host)) {
    res.status(400).json({ error: 'Invalid host' })
    return
  }

  const parts = req.query.path
  const path = Array.isArray(parts) ? parts.join('/') : String(parts || '')
  const rawUrl = req.url || ''
  const qs = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : ''
  const target = `https://${host}/${path}${qs}`

  const headers: Record<string, string> = {}
  if (req.headers['content-type']) {
    headers['Content-Type'] = String(req.headers['content-type'])
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  }

  if (req.method && !['GET', 'HEAD'].includes(req.method) && req.body !== undefined) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  try {
    const upstream = await fetch(target, init)
    const text = await upstream.text()
    res.status(upstream.status)
    const ct = upstream.headers.get('content-type')
    if (ct) res.setHeader('Content-Type', ct)
    res.send(text)
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Proxy error',
    })
  }
}
