# Beavulf Chat

Клон интерфейса чат-бота в стиле ChatGPT. Интеграция с LLM через OpenRouter, аутентификация через Supabase, чаты сохраняются в базе данных.

Доступ по ссылке: [https://beavulf-chat.vercel.app/](https://beavulf-chat.vercel.app/)

Ссылка на GitHub: [https://github.com/Beavulf/beavulf-chat](https://github.com/Beavulf/beavulf-chat)

Ссылки на видеопрезентации:

- [https://www.loom.com/share/ba6148597b334c81bb06f3031b934637](https://www.loom.com/share/ba6148597b334c81bb06f3031b934637)
- Демонстрация RealTime обновления списка чатов и сообщений на разных вкладках: [https://www.loom.com/share/b2919232a6994886802f4ec60fa4532c](https://www.loom.com/share/b2919232a6994886802f4ec60fa4532c)

## Что умеет

- Чат с ИИ (Grok через OpenRouter), ответы стримятся в реальном времени
- Список чатов в боковой панели, создание, переименование, удаление
- Аутентификация: регистрация, вход, выход
- Анонимный доступ с лимитом до 3 вопросов
- Прикрепление файлов к сообщениям (изображения, текст)
- Возможность выбирать модель ИИ для каждого сообщения

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


## Архитектура

Проект построен на **Next.js 16 App Router** с разделением на серверные и клиентские компоненты.

### Структура


| Путь            | Назначение                                                                                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(home)/`   | Основные страницы приложения (главная, чаты)                                                                                                                                                                                      |
| `app/api/`      | API Routes: `auth` (аутентификация), `chats` (CRUD чатов), `files` (работа с файлами), `upload` (загрузка)                                                                                                                        |
| `components/`   | React-компоненты: `auth/` (формы входа/регистрации), `chat-message/` (отображение сообщений), `sidebar/` (боковая панель), `ui/` (ShadcnUI примитивы)                                                                             |
| `config/`       | Конфигурация приложения: `api-config` (настройки API-маршрутов), `route-config` (настройки роутинга)                                                                                                                              |
| `constants/`    | Глобальные константы проекта (лимиты, настройки моделей, значения по умолчанию)                                                                                                                                                   |
| `fetchers/`     | Функции для HTTP-запросов к API: `auth-api`, `chats-api`, `files-api`, `message-api`                                                                                                                                              |
| `hooks/`        | Кастомные React-хуки: `use-auth` (состояние аутентификации), `use-chat-actions` (действия с чатами), `use-session` (сессия), `realtime-`* (подписки на обновления), `use-media-query`, `use-object-url`                           |
| `lib/`          | Утилиты и вспомогательные модули: `client`/`server` (клиентские/серверные утилиты), `supabase-server` (серверный клиент Supabase), `middleware` (промежуточные обработчики), `errors` (обработка ошибок), `utils` (общие утилиты) |
| `providers/`    | Провайдеры контекста: `query-provider` (обёртка TanStack Query)                                                                                                                                                                   |
| `repositories/` | Слой доступа к данным (Repository Pattern): `auth-repositories`, `chat-repository`, `file-repository`, `message-repository`, `user-limit-repository` — инкапсулируют запросы к Supabase                                           |
| `service/`      | Бизнес-логика (Service Layer): `auth-service`, `chat-service`, `file-service`, `message-service`, `user-limit-service` — оркестрируют репозитории и содержат правила приложения                                                   |
| `types/`        | TypeScript-типы: `database.types` (автогенерация из Supabase), `db-types` (типы БД), `auth-types` (типы аутентификации)                                                                                                           |


### Как работает

- **Стриминг ответов** — Vercel AI SDK (`useChat`) подключается к API-маршруту, который стримит ответ от OpenRouter через Server-Sent Events
- **Аутентификация** — Supabase Auth управляет сессиями через cookies (SSR через `@supabase/ssr`)
- **Данные чатов** — TanStack Query кеширует запросы к API, который обращается к Supabase
- **Сервер vs Клиент** — серверные компоненты (`page.tsx`, `layout.tsx`) рендерятся на сервере, интерактивные элементы (`MessageInputArea`, формы) — клиентские (`"use client"`)

### Поток запроса

```
Пользователь отправляет сообщение
  → useChat (клиент) → POST /api/chats/[id] (API Route)
    → Supabase (сохранение сообщения)
    → OpenRouter API (стриминг ответа ИИ)
    → Supabase (сохранение ответа)
  ← SSE стрим ← ответ отображается в реальном времени
```

## Стек

Next.js 16, React 19, TypeScript, Tailwind CSS 4, ShadcnUI, TanStack Query, Supabase, Vercel AI SDK, OpenRouter

## Схема базы данных

Проект использует **Supabase** (PostgreSQL). Ниже приведены все таблицы и их поля.

> **Примечание:** Аутентификация управляется через встроенный Supabase Auth — отдельных таблиц создавать не нужно.

### Таблица `chats`

Хранит чаты пользователей.


| Поле         | Тип         | Описание                                                         |
| ------------ | ----------- | ---------------------------------------------------------------- |
| `id`         | `uuid`      | Первичный ключ, генерируется автоматически (`gen_random_uuid()`) |
| `user_id`    | `uuid`      | ID пользователя (из Supabase Auth)                               |
| `title`      | `text`      | Заголовок чата (может быть `null`)                               |
| `created_at` | `timestamp` | Дата создания                                                    |
| `updated_at` | `timestamp` | Дата последнего обновления                                       |


### Таблица `messages`

Сообщения внутри чатов.


| Поле         | Тип         | Описание                                   |
| ------------ | ----------- | ------------------------------------------ |
| `id`         | `uuid`      | Первичный ключ, генерируется автоматически |
| `chat_id`    | `uuid`      | FK → `chats.id`                            |
| `user_id`    | `uuid`      | ID автора сообщения                        |
| `content`    | `text`      | Текст сообщения                            |
| `role`       | `text`      | Роль (`user` / `assistant`)                |
| `created_at` | `timestamp` | Дата создания                              |
| `updated_at` | `timestamp` | Дата обновления                            |


### Таблица `message-files`

Файлы, прикреплённые к сообщениям.


| Поле            | Тип         | Описание                                   |
| --------------- | ----------- | ------------------------------------------ |
| `id`            | `uuid`      | Первичный ключ, генерируется автоматически |
| `message_id`    | `uuid`      | FK → `messages.id`                         |
| `original_name` | `text`      | Оригинальное имя файла                     |
| `storage_path`  | `text`      | Путь к файлу в хранилище Supabase          |
| `bucket`        | `text`      | Имя бакета Supabase Storage                |
| `type`          | `text`      | MIME-тип файла                             |
| `created_at`    | `timestamp` | Дата создания                              |


### Таблица `user_limits`

Лимиты бесплатных запросов для пользователей.


| Поле         | Тип         | Описание                                                      |
| ------------ | ----------- | ------------------------------------------------------------- |
| `id`         | `uuid`      | Первичный ключ, генерируется автоматически                    |
| `user_id`    | `uuid`      | ID пользователя (из Supabase Auth)                            |
| `free_q_u`   | `integer`   | Оставшееся количество бесплатных запросов (`null` = безлимит) |
| `reset_at`   | `timestamp` | Дата сброса лимита                                            |
| `created_at` | `timestamp` | Дата создания                                                 |
| `updated_at` | `timestamp` | Дата обновления                                               |


### Функция `increment_user_questions`

Серверная функция Supabase для инкремента счётчика вопросов пользователя.

```sql
CREATE OR REPLACE FUNCTION increment_user_questions(p_user_id uuid)
RETURNS void AS $$
  update user_limits
  set free_q_u = free_q_u + 1
  where user_id = p_user_id;
$$ LANGUAGE sql;
```

### Внешние ключи


| Источник                     | Цель          |
| ---------------------------- | ------------- |
| `messages.chat_id` →         | `chats.id`    |
| `message-files.message_id` → | `messages.id` |


### Supabase Storage

Не забудьте создать бакет в **Supabase Storage** для хранения файлов (имя бакета указывается в коде, значение по умолчанию — `chat-documents`). Бакет должен быть доступен для записи авторизованным пользователям.