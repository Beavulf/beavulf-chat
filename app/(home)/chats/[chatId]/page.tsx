'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Send, Paperclip, Mic,
  Bot
} from 'lucide-react'
import { cn, dbMessageToUIMessage } from '@/lib/utils'
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


export default function ChatPage(
  { params }:
  { params: Promise<{ chatId: string }> }
) {
  const { chatId } = use(params)
  const { user } = useSession()
  const searchParams = useSearchParams()
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false)

  const firstMessage = searchParams.get('firstMessage')
  const [input, setInput] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false) 
  
  // useChat с нашим роутом
  const {status, sendMessage, messages, setMessages, regenerate, error } = useChat({
    transport: new DefaultChatTransport({
      api: API_CONFIG.MESSAGES.POST.replace(':chatId', chatId)
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
    enabled: !!user?.id && !!chatId
  })

  // инициализируем истории из БД в хук useChat, история
  useEffect(() => {
    if (historyMessages.length > 0 && !initialMessagesLoaded) {
      setMessages(historyMessages.map(dbMessageToUIMessage))
      setInitialMessagesLoaded(true)
    }
  }, [historyMessages, initialMessagesLoaded, setMessages]);

  useEffect(()=>{    
    if (error) toast.error(error?.message);
  },[error]);

  // отправка сообщения
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  // отправка по Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // авторазмер поля ввода
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

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
          <form onSubmit={handleSubmit}>
            <div className={cn(
              'relative flex flex-col rounded-2xl bg-[#2f2f2f] border transition-colors shadow-lg',
              isStreaming ? 'border-[#3f3f3f]' : 'border-[#3f3f3f] focus-within:border-[#555]'
            )}>
              <textarea
                ref={textareaRef}
                data-testid="input-message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                rows={1}
                disabled={isStreaming}
                className="resize-none bg-transparent px-4 pt-4 pb-3 text-sm text-white placeholder:text-[#5a5a5a] focus:outline-none leading-relaxed max-h-[200px] overflow-y-auto scrollbar-thin disabled:opacity-50"
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    data-testid="button-attach"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#3f3f3f] transition-colors"
                    title="Прикрепить файл"
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    type="button"
                    data-testid="button-mic"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#3f3f3f] transition-colors"
                    title="Голосовой ввод"
                  >
                    <Mic size={16} />
                  </button>
                </div>

                <button
                  type="submit"
                  data-testid="button-send"
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150',
                    input.trim() && !isStreaming
                      ? 'bg-white text-[#171717] hover:bg-white/90 shadow-sm'
                      : 'bg-[#3f3f3f] text-[#5a5a5a] cursor-not-allowed'
                  )}
                  title="Отправить"
                >
                  {isStreaming ? (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-[#5a5a5a] border-t-transparent animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </div>
          </form>

          <p className="mt-2 text-center text-[11px] text-[#3f3f3f]">
            Beavulf может допускать ошибки. Проверяйте важную информацию.
          </p>
        </div>
      </div>
    </div>
  )
}