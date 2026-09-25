import type {
  Credentials,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from '../types'

function apiHost(creds: Credentials): string {
  try {
    return new URL(creds.apiUrl || 'https://api.green-api.com').host
  } catch {
    return 'api.green-api.com'
  }
}

function instancePath(creds: Credentials, methodPath: string): string {
  return `/waInstance${creds.idInstance}${methodPath}`
}

async function greenFetch(
  creds: Credentials,
  methodPath: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('X-Green-Api-Host', apiHost(creds))
  headers.set('X-Green-Api-Path', instancePath(creds, methodPath))

  return fetch('/api/proxy', {
    ...init,
    headers,
  })
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  const text = await res.text()
  if (!text) return null as T
  return JSON.parse(text) as T
}

export async function sendMessage(
  creds: Credentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  const res = await greenFetch(creds, `/sendMessage/${creds.apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  return parseJson<SendMessageResponse>(res)
}

export async function receiveNotification(
  creds: Credentials,
  receiveTimeout = 5,
): Promise<ReceiveNotificationResponse> {
  const res = await greenFetch(
    creds,
    `/receiveNotification/${creds.apiTokenInstance}?receiveTimeout=${receiveTimeout}`,
  )
  return parseJson<ReceiveNotificationResponse>(res)
}

export async function deleteNotification(
  creds: Credentials,
  receiptId: number,
): Promise<void> {
  const res = await greenFetch(
    creds,
    `/deleteNotification/${creds.apiTokenInstance}/${receiptId}`,
    { method: 'DELETE' },
  )
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
}

/** Clear webhook so HTTP receiveNotification queue works */
export async function enableHttpReceiving(creds: Credentials): Promise<void> {
  const res = await greenFetch(creds, `/setSettings/${creds.apiTokenInstance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
      stateWebhook: 'yes',
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
}
