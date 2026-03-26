Архитектура проверки лимита для анонимов
Где проверять
В сервисе (app/service/chat-service.ts) — бизнес-логика лимитов:

// app/service/chat-service.ts
import { chatRepository } from '@/app/repositories/chat-repository'
import { messageRepository } from '@/app/repositories/message-repository'
import { getUser } from './auth-service'

const ANON_MESSAGE_LIMIT = 3

export const chatService = {
  async checkMessageLimit() {
    const user = await getUser()
    
    // Авторизованный — без лимитов
    if (user) {
      return { allowed: true }
    }
    
    // Аноним — считаем сообщения
    const messageCount = await messageRepository.countByAnonSession()
    
    if (messageCount >= ANON_MESSAGE_LIMIT) {
      return { 
        allowed: false, 
        reason: 'limit_reached' as const,
        current: messageCount,
        limit: ANON_MESSAGE_LIMIT
      }
    }
    
    return { allowed: true, remaining: ANON_MESSAGE_LIMIT - messageCount }
  },
}
Как отслеживать анонима
Вариант 1: Cookie + session ID (рекомендую)

// app/service/auth-service.ts
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getAnonSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('anon_session')?.value
  
  if (!sessionId) {
    sessionId = uuidv4()
    // Устанавливаем cookie на 30 дней
    cookieStore.set('anon_session', sessionId, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
    })
  }
  
  return sessionId
}
Репозиторий для подсчёта
// app/repositories/message-repository.ts
import { supabaseServer } from '@/lib/supabase-server'

export const messageRepository = {
  async countByAnonSession(sessionId: string) {
    const { count, error } = await supabaseServer
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('anon_session_id', sessionId)
      .is('user_id', null)  // Только анонимные
    
    if (error) throw error
    return count || 0
  },
  
  async create(data: {
    chatId: string
    content: string
    role: 'user' | 'assistant'
    userId?: string
    anonSessionId?: string
  }) {
    const { data: message, error } = await supabaseServer
      .from('messages')
      .insert({
        chat_id: data.chatId,
        content: data.content,
        role: data.role,
        user_id: data.userId,
        anon_session_id: data.anonSessionId,
      })
      .select()
      .single()
    
    if (error) throw error
    return message
  },
}
API endpoint
// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { chatService } from '@/app/service/chat-service'
import { messageService } from '@/app/service/message-service'
import { getUser, getAnonSessionId } from '@/app/service/auth-service'

export async function POST(request: NextRequest) {
  try {
    const { chatId, content } = await request.json()
    
    // Проверяем лимит
    const limitCheck = await chatService.checkMessageLimit()
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'limit_reached',
        message: `Вы исчерпали лимит в ${limitCheck.limit} сообщения`,
        current: limitCheck.current,
      }, { status: 403 })
    }
    
    // Получаем идентификатор пользователя
    const user = await getUser()
    const anonSessionId = !user ? await getAnonSessionId() : undefined
    
    // Отправляем сообщение
    const message = await messageService.sendMessage({
      chatId,
      content,
      userId: user?.id,
      anonSessionId,
    })
    
    return NextResponse.json(message)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
Схема БД
-- messages таблица
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id),
  user_id UUID REFERENCES auth.users(id),  -- NULL для анонимов
  anon_session_id VARCHAR(255),            -- Cookie ID для анонимов
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,               -- 'user' | 'assistant'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого подсчёта
CREATE INDEX idx_messages_anon_session ON messages(anon_session_id);
На клиенте (UI)
// app/chats/[id]/page.tsx
const sendMessage = useMutation({
  mutationFn: async (data) => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json()
      throw error
    }
    return res.json()
  },
  onError: (error) => {
    if (error.error === 'limit_reached') {
      // Показать модалку с предложением зарегистрироваться
      setShowLoginModal(true)
    }
  },
})