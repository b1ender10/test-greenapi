import { useEffect, useRef } from 'react'
import {
  deleteNotification,
  enableHttpReceiving,
  receiveNotification,
} from '../api/greenApi'
import { useApp } from '../context/AppContext'
import type { Chat, NotificationBody } from '../types'

function extractText(body: NotificationBody): string | null {
  const text =
    body.messageData?.textMessageData?.textMessage ??
    body.messageData?.extendedTextMessageData?.text
  return text?.trim() ? text : null
}

function isTextMessage(body: NotificationBody): boolean {
  const type = body.messageData?.typeMessage
  return !type || type === 'textMessage' || type === 'extendedTextMessage'
}

/** Telegram returns numeric chatId; UI chats are often phone@c.us */
function resolveChatId(
  body: NotificationBody,
  chats: Record<string, Chat>,
): string | null {
  const rawId = body.senderData?.chatId
  if (!rawId) return null
  if (chats[rawId]) return rawId

  const phoneRaw = body.senderData?.senderPhoneNumber
  if (phoneRaw != null && String(phoneRaw) !== '') {
    const digits = String(phoneRaw).replace(/\D/g, '')
    const asCus = `${digits}@c.us`
    if (chats[asCus]) return asCus
    const found = Object.values(chats).find(
      (c) => c.phone.replace(/\D/g, '') === digits || c.chatId === digits,
    )
    if (found) return found.chatId
  }

  return rawId
}

let pollOwner: symbol | null = null

export function useNotifications() {
  const { credentials, chats, addMessage, ensureChat } = useApp()
  const chatsRef = useRef(chats)
  chatsRef.current = chats

  useEffect(() => {
    if (!credentials) return

    const owner = Symbol('poll')
    pollOwner = owner
    const creds = credentials
    let stopped = false

    const loop = async () => {
      try {
        await enableHttpReceiving(creds)
      } catch {
        /* cabinet settings may already be correct */
      }

      while (!stopped && pollOwner === owner) {
        try {
          const notification = await receiveNotification(creds, 20)
          if (stopped || pollOwner !== owner) break
          if (!notification) continue

          const { receiptId, body } = notification
          const type = body.typeWebhook

          if (
            (type === 'incomingMessageReceived' ||
              type === 'outgoingAPIMessageReceived' ||
              type === 'outgoingMessageReceived') &&
            isTextMessage(body)
          ) {
            const chatId = resolveChatId(body, chatsRef.current)
            const text = extractText(body)
            if (chatId && text) {
              ensureChat(
                chatId,
                body.senderData?.chatName ||
                  body.senderData?.senderName ||
                  body.senderData?.senderContactName,
              )
              addMessage(chatId, {
                id: body.idMessage || `${receiptId}-${body.timestamp}`,
                text,
                timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
                direction:
                  type === 'incomingMessageReceived' ? 'incoming' : 'outgoing',
              })
            }
          }

          await deleteNotification(creds, receiptId)
        } catch {
          await new Promise((r) => setTimeout(r, 2000))
        }
      }
    }

    void loop()
    return () => {
      stopped = true
      if (pollOwner === owner) pollOwner = null
    }
  }, [credentials, addMessage, ensureChat])
}
