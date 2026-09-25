import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import styles from './LoginForm.module.css'

const DEFAULT_API = 'https://api.green-api.com'

export function LoginForm() {
  const { login } = useApp()
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API)
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполните idInstance и apiTokenInstance')
      return
    }
    setError('')
    login({ idInstance, apiTokenInstance, apiUrl: apiUrl || DEFAULT_API })
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.logo}>TG</div>
        <h1 className={styles.title}>GREEN-API Chat</h1>
        <p className={styles.hint}>
          Введите данные Telegram-инстанса из личного кабинета GREEN-API
        </p>

        <label className={styles.label}>
          idInstance
          <input
            className={styles.input}
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className={styles.label}>
          apiTokenInstance
          <input
            className={styles.input}
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <label className={styles.label}>
          apiUrl
          <input
            className={styles.input}
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder={DEFAULT_API}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit">
          Войти
        </button>
      </form>
    </div>
  )
}
