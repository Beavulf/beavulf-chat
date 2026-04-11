# Beavulf Chat

Клон интерфейса чат-бота в стиле ChatGPT. Интеграция с LLM через OpenRouter, аутентификация через Supabase, чаты сохраняются в базе данных.

Доступ по ссылке: [https://beavulf-chat.vercel.app/](https://beavulf-chat.vercel.app/)

## Что умеет

- Чат с ИИ (Grok через OpenRouter), ответы стримятся в реальном времени
- Список чатов в боковой панели, создание, переименование, удаление
- Аутентификация: регистрация, вход, выход
- Анонимный доступ с лимитом до 3 вопросов
- Прикрепление файлов к сообщениям (изображения, текст)

## Требования

- Node.js 20+
- npm (или любой другой пакетный менеджер)

## Запуск

1. Клон репозитория и зайти в папку проекта:

```
git clone <repo-url>
cd beavulf-chat
```

1. Установить зависимости:

```
npm install
```

1. Создать файл `.env.local` в корне проекта и заполнить переменные:

```
NEXT_PUBLIC_SUPABASE_URL=<твой URL Supabase проекта>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<твой publishable key>
SUPABASE_SERVICE_ROLE_KEY=<твой service role key>
OPENROUTER_API_KEY=<твой API ключ OpenRouter>
```

Ключи берутся из панели Supabase и OpenRouter. Без них проект не запустится.

1. Запустить дев-сервер:

```
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000) в браузере.

## Сборка для продакшена

```
npm run build
npm run start
```

## Скрипты


| Команда             | Что делает                         |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Дев-сервер с горячей перезагрузкой |
| `npm run build`     | Продакшен-сборка                   |
| `npm run start`     | Запуск продакшен-сервера           |
| `npm run lint`      | Линтинг                            |
| `npm run gen:types` | Генерация TS-типов из Supabase     |


## Стек

Next.js 16, React 19, TypeScript, Tailwind CSS 4, ShadcnUI, TanStack Query, Supabase, Vercel AI SDK, OpenRouter