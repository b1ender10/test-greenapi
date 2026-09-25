import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { formatTime } from '../utils/phone'
import styles from './ChatList.module.css'

export function ChatList() {
  const { chatList, activeChatId, setActiveChatId, createChat, logout } = useApp()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [showNew, setShowNew] = useState(false)

  const onCreate = (e: FormEvent) => {
    e.preventDefault()
    try {
      createChat(phone)
      setPhone('')
      setError('')
      setShowNew(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    }
  }

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <span className={styles.brand}>Чаты</span>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setShowNew((v) => !v)}
            title="Новый чат"
          >
            +
          </button>
          <button type="button" className={styles.textBtn} onClick={logout} title="Выйти">
            Выйти
          </button>
        </div>
      </header>

      {showNew && (
        <form className={styles.newChat} onSubmit={onCreate}>
          <input
            className={styles.phoneInput}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Номер, например 79991234567"
            autoFocus
          />
          <button type="submit" className={styles.createBtn}>
            Создать
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      )}

      <ul className={styles.list}>
        {chatList.length === 0 && (
          <li className={styles.empty}>Нет чатов — создайте новый</li>
        )}
        {chatList.map((chat) => {
          const last = chat.messages.at(-1)
          return (
            <li key={chat.chatId}>
              <button
                type="button"
                className={`${styles.item} ${activeChatId === chat.chatId ? styles.active : ''}`}
                onClick={() => setActiveChatId(chat.chatId)}
              >
                <span className={styles.avatar}>{chat.title.slice(0, 1)}</span>
                <span className={styles.meta}>
                  <span className={styles.row}>
                    <span className={styles.name}>{chat.title}</span>
                    {last && (
                      <span className={styles.time}>{formatTime(last.timestamp)}</span>
                    )}
                  </span>
                  <span className={styles.preview}>
                    {last?.text ?? 'Нет сообщений'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
