/** Digits only → chatId like 79876543210@c.us */
export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) throw new Error('Введите номер телефона')
  return `${digits}@c.us`
}

export function chatIdToPhone(chatId: string): string {
  return chatId.replace(/@c\.us$/i, '')
}

export function formatPhoneTitle(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('7')) {
    return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`
  }
  return phone.startsWith('+') ? phone : `+${d}`
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
