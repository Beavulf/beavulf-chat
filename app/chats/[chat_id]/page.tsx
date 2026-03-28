'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Send, Paperclip, Mic, Copy, ThumbsUp, ThumbsDown,
  RefreshCw, User, Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: Date
}

let msgIdCounter = 0
function genId() { return `msg-${++msgIdCounter}-${Date.now()}` }

export default function ChatPage({ params }: { params: Promise<{ chat_id: string }> }) {
  const { chat_id } = use(params)
  const searchParams = useSearchParams()
  const firstMessage = searchParams.get('firstMessage')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  // If arriving from home page with a first message, auto-send it
  useEffect(() => {
    if (firstMessage && !initialized.current) {
      initialized.current = true
      sendMessage(firstMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    const userMsg: Message = { id: genId(), role: 'user', content: trimmed, createdAt: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)

    // Stub: simulate streaming assistant response
    const assistantId = genId()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    // Simulate word-by-word streaming
    const fakeReply = `Привет! Это тестовый ответ на: «${trimmed}». LLM интеграция будет добавлена через API-маршрут /api/messages. Используй fetch с ReadableStream для потоковых ответов от OpenAI / Gemini.`
    let i = 0
    const words = fakeReply.split(' ')

    const stream = () => {
      if (i >= words.length) {
        setIsStreaming(false)
        return
      }
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: words.slice(0, i + 1).join(' ') }
          : m
      ))
      i++
      setTimeout(stream, 40)
    }
    setTimeout(stream, 300)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-10 h-10 rounded-full bg-[#2f2f2f] flex items-center justify-center mb-3">
                <Bot size={20} className="text-[#8e8ea0]" />
              </div>
              <p className="text-sm text-[#5a5a5a]">Начните разговор</p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Streaming indicator */}
          {isStreaming && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-center gap-2 pl-10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8e8ea0] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#8e8ea0] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#8e8ea0] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

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

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      data-testid={`message-${message.role}`}
      className={cn('group flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/10">
          <svg viewBox="0 0 28 28" fill="none" className="w-4 h-4">
            <path d="M6 21V7h7.5a5 5 0 0 1 0 10H6M13.5 17H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-[#2f2f2f] text-white rounded-br-sm'
              : 'text-[#ececec] rounded-bl-sm'
          )}
        >
          {message.content || (
            <span className="opacity-0">placeholder</span>
          )}
          {message.role === 'assistant' && message.content && (
            <span className="inline-block w-0.5 h-[1em] bg-white/70 ml-0.5 animate-pulse align-middle" style={{ display: 'none' }} />
          )}
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && message.content && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
            <button
              onClick={handleCopy}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#2f2f2f] transition-colors"
              title={copied ? 'Скопировано!' : 'Скопировать'}
            >
              <Copy size={13} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#2f2f2f] transition-colors"
              title="Полезно"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#2f2f2f] transition-colors"
              title="Не полезно"
            >
              <ThumbsDown size={13} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#2f2f2f] transition-colors"
              title="Сгенерировать заново"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3f3f3f] border border-[#4f4f4f]">
          <User size={14} className="text-[#8e8ea0]" />
        </div>
      )}
    </div>
  )
}
