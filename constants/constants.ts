export const ANON_SESSION = {
  RESET_AT: 30 * 24 * 60 * 60 * 1000,
  MESSAGE_LIMIT: 3,
}

export const STALE_TIME = {
  CHATS: 5 * 60 * 1000,
  SESSION: 5 * 60 * 1000
}

export const LOCAL_STORAGE_ITEM = {
  LAST_MODEL: 'lastUsedModel',
  LAST_FILE: 'lastUploadedFile'
}

export const AI_MODELS = {
  GROK: 'x-ai/grok-4.20',
  QWEN: 'qwen/qwen3.6-plus',
  GPT_NANO: 'openai/gpt-5.4-nano',
  GEMINI_FLASH: 'google/gemini-2.5-flash-lite'
} as const

export type AiModels = typeof AI_MODELS[keyof typeof AI_MODELS];


// допустимые типы файлов
export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
];

export const ERRORS_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  ALREADY_AUTHORIZED: 'ALREADY_AUTHORIZED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ANON_USER_CREATION_FAILED: 'ANON_USER_CREATION_FAILED',
  MESSAGE_LIMIT_EXCEEDED: 'MESSAGE_LIMIT_EXCEEDED',
  INVALID_TITLE: 'INVALID_TITLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  ALREADY_EXISTS: 'ALREADY_EXISTS'
} as const;

export type ErrorCodes = typeof ERRORS_CODES[keyof typeof ERRORS_CODES];

export const QUERY_KEYS = {
  CHATS: 'chats',
  AUTH: 'auth',
  SESSION: 'session',
  MESSAGES: 'messages',
  MESSAGE_FILES: 'message-files',
} as const

export type QueryKeys = typeof QUERY_KEYS[keyof typeof QUERY_KEYS]