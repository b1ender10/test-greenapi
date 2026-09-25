import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Chat, Credentials, Message } from '../types'
import { chatIdToPhone, formatPhoneTitle, phoneToChatId } from '../utils/phone'

const STORAGE_KEY = 'green-api-credentials'
const CHATS_KEY = 'green-api-chats'

type ChatStore = Record<string, Chat>

type AppContextValue = {
  credentials: Credentials | null
  login: (creds: Credentials) => void
  logout: () => void
  chats: ChatStore
  chatList: Chat[]
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  createChat: (phone: string) => string
  addMessage: (chatId: string, message: Omit<Message, 'chatId'>) => void
  ensureChat: (chatId: string, title?: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Credentials
    if (!parsed.idInstance || !parsed.apiTokenInstance) return null
    return {
      ...parsed,
      apiUrl: parsed.apiUrl || 'https://api.green-api.com',
    }
  } catch {
    return null
  }
}

function loadChats(): ChatStore {
  try {
    const raw = localStorage.getItem(CHATS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ChatStore
  } catch {
    return {}
  }
}

function persistChats(chats: ChatStore) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials)
  const [chats, setChats] = useState<ChatStore>(loadChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const updateChats = useCallback((updater: (prev: ChatStore) => ChatStore) => {
    setChats((prev) => {
      const next = updater(prev)
      persistChats(next)
      return next
    })
  }, [])

  const login = useCallback((creds: Credentials) => {
    const normalized: Credentials = {
      idInstance: creds.idInstance.trim(),
      apiTokenInstance: creds.apiTokenInstance.trim(),
      apiUrl: (creds.apiUrl || 'https://api.green-api.com').trim().replace(/\/$/, ''),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    setCredentials(normalized)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCredentials(null)
    setActiveChatId(null)
  }, [])

  const ensureChat = useCallback(
    (chatId: string, title?: string) => {
      updateChats((prev) => {
        if (prev[chatId]) {
          if (title && prev[chatId].title !== title) {
            return { ...prev, [chatId]: { ...prev[chatId], title } }
          }
          return prev
        }
        const phone = chatIdToPhone(chatId)
        return {
          ...prev,
          [chatId]: {
            chatId,
            phone,
            title: title || formatPhoneTitle(phone),
            messages: [],
          },
        }
      })
    },
    [updateChats],
  )

  const createChat = useCallback(
    (phone: string) => {
      const chatId = phoneToChatId(phone)
      ensureChat(chatId, formatPhoneTitle(phone))
      setActiveChatId(chatId)
      return chatId
    },
    [ensureChat],
  )

  const addMessage = useCallback(
    (chatId: string, message: Omit<Message, 'chatId'>) => {
      updateChats((prev) => {
        const existing = prev[chatId]
        const phone = chatIdToPhone(chatId)
        const chat: Chat = existing ?? {
          chatId,
          phone,
          title: formatPhoneTitle(phone),
          messages: [],
        }
        if (chat.messages.some((m) => m.id === message.id)) return prev
        return {
          ...prev,
          [chatId]: {
            ...chat,
            messages: [...chat.messages, { ...message, chatId }],
          },
        }
      })
    },
    [updateChats],
  )

  const chatList = useMemo(() => {
    return Object.values(chats).sort((a, b) => {
      const ta = a.messages.at(-1)?.timestamp ?? 0
      const tb = b.messages.at(-1)?.timestamp ?? 0
      return tb - ta
    })
  }, [chats])

  const value = useMemo<AppContextValue>(
    () => ({
      credentials,
      login,
      logout,
      chats,
      chatList,
      activeChatId,
      setActiveChatId,
      createChat,
      addMessage,
      ensureChat,
    }),
    [
      credentials,
      login,
      logout,
      chats,
      chatList,
      activeChatId,
      createChat,
      addMessage,
      ensureChat,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
