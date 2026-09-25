export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  const host = request.headers.get('x-green-api-host') || 'api.green-api.com'
  const path = request.headers.get('x-green-api-path')

  if (!/^[a-z0-9.-]+$/i.test(host)) {
    return Response.json({ error: 'Invalid host' }, { status: 400 })
  }
  if (!path || !path.startsWith('/')) {
    return Response.json({ error: 'Invalid path' }, { status: 400 })
  }

  const target = `https://${host}${path}`
  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('Content-Type', contentType)

  const init: RequestInit = {
    method: request.method,
    headers,
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  try {
    const upstream = await fetch(target, init)
    const body = await upstream.arrayBuffer()
    const out = new Headers()
    const ct = upstream.headers.get('content-type')
    if (ct) out.set('Content-Type', ct)
    return new Response(body, { status: upstream.status, headers: out })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Proxy error' },
      { status: 502 },
    )
  }
}
