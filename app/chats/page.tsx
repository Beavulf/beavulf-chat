'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Send, Paperclip, Mic, Sparkles, Zap, Globe, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  {
    icon: Sparkles,
    title: 'Объясни концепцию',
    subtitle: 'React Server Components',
  },
  {
    icon: Code2,
    title: 'Напиши код',
    subtitle: 'REST API на Node.js + Express',
  },
  {
    icon: Globe,
    title: 'Переведи текст',
    subtitle: 'с русского на английский',
  },
  {
    icon: Zap,
    title: 'Помоги отладить',
    subtitle: 'TypeScript ошибку',
  },
]

async function createChatAndRedirect(message: string) {
  const res = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: message.slice(0, 60) }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Failed to create chat')
  return Array.isArray(data) ? data[0] : data
}

export default function ChatsPage() {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createChatAndRedirect,
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      if (chat?.id) {
        router.push(`/chats/${chat.id}?firstMessage=${encodeURIComponent(message)}`)
      }
    },
  })

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || createMutation.isPending) return
    createMutation.mutate(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [message])

  const handleSuggestion = (title: string, subtitle: string) => {
    setMessage(`${title}: ${subtitle}`)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      {/* Background subtle gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/0 via-transparent to-[#171717]/30" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl px-4 pb-32">
        {/* Logo + title */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <svg
            aria-label="Beavulf Chat"
            viewBox="0 0 48 48"
            fill="none"
            className="w-12 h-12"
          >
            <circle cx="24" cy="24" r="22" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="22" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="4 3" />
            <path
              d="M13 33V15h9a6 6 0 0 1 0 12H13M22 27H35"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-2xl font-semibold text-white/90 tracking-tight">
            Чем могу помочь?
          </h1>
        </div>

        {/* Suggestion chips */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
          {SUGGESTIONS.map(({ icon: Icon, title, subtitle }) => (
            <button
              key={title}
              data-testid={`button-suggestion-${title}`}
              onClick={() => handleSuggestion(title, subtitle)}
              className="flex items-start gap-3 rounded-xl bg-[#2f2f2f] hover:bg-[#383838] border border-[#3f3f3f] hover:border-[#4f4f4f] px-4 py-3.5 text-left transition-all duration-150 group"
            >
              <Icon size={18} className="mt-0.5 shrink-0 text-[#8e8ea0] group-hover:text-[#acacac] transition-colors" />
              <div>
                <p className="text-sm font-medium text-[#d1d1d1] group-hover:text-white transition-colors leading-snug">{title}</p>
                <p className="text-xs text-[#5a5a5a] group-hover:text-[#7a7a7a] transition-colors mt-0.5 leading-snug">{subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative flex flex-col rounded-2xl bg-[#2f2f2f] border border-[#3f3f3f] focus-within:border-[#555] transition-colors shadow-lg">
            <textarea
              ref={textareaRef}
              data-testid="input-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              rows={1}
              className="resize-none bg-transparent px-4 pt-4 pb-3 text-sm text-white placeholder:text-[#5a5a5a] focus:outline-none leading-relaxed max-h-[200px] overflow-y-auto scrollbar-thin"
            />

            {/* Toolbar */}
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
                disabled={!message.trim() || createMutation.isPending}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150',
                  message.trim() && !createMutation.isPending
                    ? 'bg-white text-[#171717] hover:bg-white/90 shadow-sm'
                    : 'bg-[#3f3f3f] text-[#5a5a5a] cursor-not-allowed'
                )}
                title="Отправить"
              >
                {createMutation.isPending ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-[#5a5a5a] border-t-transparent animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Disclaimer */}
        <p className="mt-4 text-center text-[11px] text-[#3f3f3f] leading-relaxed">
          Beavulf может допускать ошибки. Проверяйте важную информацию.
        </p>
      </div>
    </div>
  )
}
