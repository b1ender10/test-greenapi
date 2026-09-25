import { LoginForm } from './components/LoginForm'
import { ChatList } from './components/ChatList'
import { ChatWindow } from './components/ChatWindow'
import { useApp } from './context/AppContext'
import { useNotifications } from './hooks/useNotifications'
import styles from './App.module.css'

function Shell() {
  const { credentials } = useApp()
  useNotifications()

  if (!credentials) return <LoginForm />

  return (
    <div className={styles.layout}>
      <ChatList />
      <ChatWindow />
    </div>
  )
}

export default function App() {
  return <Shell />
}
