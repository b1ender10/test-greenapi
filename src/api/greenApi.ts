import type {
  Credentials,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from '../types'

function instanceBase(creds: Credentials): string {
  return `/api/waInstance${creds.idInstance}`
}

function apiHost(creds: Credentials): string {
  try {
    return new URL(creds.apiUrl || 'https://api.green-api.com').host
  } catch {
    return 'api.green-api.com'
  }
}

function headers(creds: Credentials, json = false): HeadersInit {
  const h: Record<string, string> = {
    'X-Green-Api-Host': apiHost(creds),
  }
  if (json) h['Content-Type'] = 'application/json'
  return h
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
  const url = `${instanceBase(creds)}/sendMessage/${creds.apiTokenInstance}`
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(creds, true),
    body: JSON.stringify({ chatId, message }),
  })
  return parseJson<SendMessageResponse>(res)
}

export async function receiveNotification(
  creds: Credentials,
  receiveTimeout = 5,
): Promise<ReceiveNotificationResponse> {
  const url = `${instanceBase(creds)}/receiveNotification/${creds.apiTokenInstance}?receiveTimeout=${receiveTimeout}`
  const res = await fetch(url, { headers: headers(creds) })
  return parseJson<ReceiveNotificationResponse>(res)
}

export async function deleteNotification(
  creds: Credentials,
  receiptId: number,
): Promise<void> {
  const url = `${instanceBase(creds)}/deleteNotification/${creds.apiTokenInstance}/${receiptId}`
  const res = await fetch(url, { method: 'DELETE', headers: headers(creds) })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
}

/** Clear webhook so HTTP receiveNotification queue works */
export async function enableHttpReceiving(creds: Credentials): Promise<void> {
  const url = `${instanceBase(creds)}/setSettings/${creds.apiTokenInstance}`
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(creds, true),
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
