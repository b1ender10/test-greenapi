# Тестовое задание — Фронтенд разработчик React (Telegram + GREEN-API)

Веб-чат для отправки и получения текстовых сообщений в Telegram через [GREEN-API](https://green-api.com/telegram/).

Интерфейс упрощённо повторяет [Telegram Web](https://web.telegram.org/).

## Возможности

- Вход по `idInstance` / `apiTokenInstance` / `apiUrl` (сохраняются в `localStorage`)
- Создание чата по номеру телефона
- Отправка текста — API [`SendMessage`](https://green-api.com/en/telegram/docs/api/sending/SendMessage/)
- Получение сообщений — HTTP API [`ReceiveNotification`](https://green-api.com/en/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/) + `DeleteNotification`
- Прокси `/api` (Vite / Vercel) для обхода CORS

## Стек

- React 19 + TypeScript + Vite 6
- CSS Modules

## Требования к инстансу GREEN-API

1. [Личный кабинет](https://console.green-api.com/) → Telegram-инстанс (тариф Developer)
2. Авторизовать инстанс
3. Webhook URL — **пустой**
4. Включить получение входящих сообщений
5. Скопировать `idInstance`, `apiTokenInstance`, `apiUrl`

При входе в приложение настройки HTTP-приёма выставляются через `setSettings` автоматически.

## Локальный запуск

```bash
npm install
npm run dev
```

Открыть http://localhost:5173

1. Ввести credentials из кабинета
2. «+» → номер получателя (например `79991234567`)
3. Отправить сообщение
4. Ответить из Telegram — ответ появится в чате

## Сборка

```bash
npm run build
npm run preview
```

## Деплой (Vercel)

```bash
npx vercel
```

Прокси: [`api/[...path].ts`](api/[...path].ts) → хост из `apiUrl` (заголовок `X-Green-Api-Host`).

## Структура

```
src/
  api/greenApi.ts           # send / receive / delete / setSettings
  hooks/useNotifications.ts # long-poll очереди
  context/AppContext.tsx
  components/               # Login, список чатов, окно чата
  utils/phone.ts
api/
  [...path].ts              # serverless-прокси для Vercel
```

## Примечание по безопасности

`idInstance` и `apiTokenInstance` хранятся только в браузере пользователя и не коммитятся в репозиторий.
