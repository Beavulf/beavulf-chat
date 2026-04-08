'use client'

import { useRef, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Bot
} from 'lucide-react'
import { dbMessageToUIMessage } from '@/lib/utils'
import { useRealtimeMessages } from '@/hooks/realtime-messages'
import { useQuery } from '@tanstack/react-query'
import { getMessages } from '@/fetchers/message-api'
import { QUERY_KEYS } from '@/constants/constants'
import { useSession } from '@/hooks/use-session'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { API_CONFIG } from '@/config/api-config'
import { MessageBubble } from '@/components/chat-message/MessageBubble'
import { toast } from 'sonner'
import { MessageInputArea } from '@/components/MessageInputArea'


export default function ChatPage(
  { params }:
  { params: Promise<{ chatId: string }> }
) {
  const { chatId } = use(params)
  const { user } = useSession()
  const searchParams = useSearchParams()
  const initialMessagesLoaded = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false) 
  const firstMessage = searchParams.get('firstMessage')
  
  // useChat с нашим роутом и отправкой одного сообщения в запросе
  const {status, sendMessage, messages, setMessages, regenerate, error } = useChat({
    transport: new DefaultChatTransport({
      api: API_CONFIG.MESSAGES.POST.replace(':chatId', chatId),
      prepareSendMessagesRequest: ({id, messages}) => {
        return {
          body: {
            id,
            message: messages[messages.length - 1]
          }
        }
      }
    }),
  })
  const isStreaming = status === 'submitted' || status === 'streaming';
  
  // Если переход с главной и первым сообщением
  useEffect(() => {
    if (firstMessage && !initialized.current && !initialMessagesLoaded) {
      initialized.current = true
      sendMessage({ text: firstMessage }) 
    }
  }, [firstMessage, sendMessage, initialMessagesLoaded]);

  useRealtimeMessages(chatId);

  // Получение истории сообщений из БД
  const { data: historyMessages = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, chatId],
    queryFn: () => getMessages(chatId),
    staleTime: 300 * 60 * 1000,
    enabled: !!user?.id || !!chatId
  })

  // инициализируем истории из БД в хук useChat
  useEffect(() => {   
    if (historyMessages.length > 0 && !initialMessagesLoaded.current && !initialized.current) {
      setMessages(historyMessages
        .slice()
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(dbMessageToUIMessage)
      )      
      initialMessagesLoaded.current = true;
    }
  }, [historyMessages, initialMessagesLoaded, setMessages]);

  useEffect(()=>{    
    if (error) toast.error(error?.message);
  },[error]);

  // отправка сообщения
  const handleSubmit = (text: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
  }

  // в конец
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-10 h-10 rounded-full bg-[#2f2f2f] flex items-center justify-center mb-3">
                <Bot size={20} className="text-[#8e8ea0]" />
              </div>
              <p className="text-sm text-[#5a5a5a]">Начните разговор</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                status={status}
                isLast={isLastMessage}
                regenerate={regenerate}
              />
            )
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 pb-5 pt-2">
        <div className="mx-auto max-w-3xl">
          <MessageInputArea handleSubmit={handleSubmit} isPendingOrStreaming={isStreaming}/>
          <p className="mt-2 text-center text-[11px] text-[#3f3f3f]">
            Beavulf может допускать ошибки. Проверяйте важную информацию.
          </p>
        </div>
      </div>
    </div>
  )
}