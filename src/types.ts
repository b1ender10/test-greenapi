export type Credentials = {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type Message = {
  id: string
  chatId: string
  text: string
  timestamp: number
  direction: 'incoming' | 'outgoing'
}

export type Chat = {
  chatId: string
  phone: string
  title: string
  messages: Message[]
}

export type SendMessageResponse = {
  idMessage: string
}

export type NotificationBody = {
  typeWebhook?: string
  instanceData?: unknown
  timestamp?: number
  idMessage?: string
  senderData?: {
    chatId?: string
    chatName?: string
    sender?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number | string
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
    extendedTextMessageData?: {
      text?: string
    }
  }
}

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
} | null
