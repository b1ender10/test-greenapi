import { useEffect, useRef, useState, type FormEvent } from 'react'
import { sendMessage } from '../api/greenApi'
import { useApp } from '../context/AppContext'
import { formatTime } from '../utils/phone'
import styles from './ChatWindow.module.css'

export function ChatWindow() {
  const { credentials, chats, activeChatId, addMessage } = useApp()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const chat = activeChatId ? chats[activeChatId] : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages.length, activeChatId])

  if (!activeChatId || !chat) {
    return (
      <section className={styles.emptyPane}>
        <div className={styles.emptyCard}>
          <p>Выберите чат или создайте новый</p>
        </div>
      </section>
    )
  }

  const onSend = async (e: FormEvent) => {
    e.preventDefault()
    if (!credentials || !text.trim() || sending) return
    const message = text.trim()
    setSending(true)
    setError('')
    try {
      const { idMessage } = await sendMessage(credentials, chat.chatId, message)
      addMessage(chat.chatId, {
        id: idMessage,
        text: message,
        timestamp: Date.now(),
        direction: 'outgoing',
      })
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className={styles.pane}>
      <header className={styles.header}>
        <span className={styles.avatar}>{chat.title.slice(0, 1)}</span>
        <div>
          <div className={styles.title}>{chat.title}</div>
          <div className={styles.subtitle}>{chat.phone}</div>
        </div>
      </header>

      <div className={styles.messages}>
        {chat.messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.bubble} ${m.direction === 'outgoing' ? styles.out : styles.in}`}
          >
            <p className={styles.text}>{m.text}</p>
            <time className={styles.time}>{formatTime(m.timestamp)}</time>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.composer} onSubmit={onSend}>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение"
          disabled={sending}
        />
        <button className={styles.send} type="submit" disabled={sending || !text.trim()}>
          ➤
        </button>
      </form>
    </section>
  )
}
