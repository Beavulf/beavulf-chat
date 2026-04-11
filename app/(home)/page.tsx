'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Sparkles, Zap, Globe, Code2, LoaderCircle } from 'lucide-react'
import { useSession } from '@/hooks/use-session'
import { createChat } from '@/fetchers/chats-api'
import { QUERY_KEYS } from '@/constants/constants'
import { ROUTE_CONFIG } from '@/config/route-config'
import { MessageInputArea } from '@/components/MessageInputArea'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

export default function ChatsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [message, setMessage] = useState<string>('');

  // создание сообщения
  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (chat, firstMessageText) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHATS, user.id] })
      }
      if (chat?.id) {
        router.push(
          `${ROUTE_CONFIG.CHAT_BY_ID.replace(':id', chat.id)}?firstMessage=${encodeURIComponent(
            firstMessageText ?? '',
          )}`,
        )
      }
    },
    onError: (e) => {
      toast.error(e.message || 'Не удалось создать чат');
    },
  })

  // подтверждение отправки сообщения
  const handleSubmit = async ({input,e}:{input: string, e?: React.FormEvent}) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || createMutation.isPending) return;

    await createMutation.mutateAsync(trimmed);
  }

  // выбрать шаблон сообщения
  const handleSuggestion = (title: string, subtitle: string) => {
    setMessage(`${title}: ${subtitle}`)
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

        {/* шаблоны сообщений */}
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
        {(createMutation.isPending || createMutation.isSuccess) ? 
          <span className={cn('text-[gray] flex gap-3 items-center')}><LoaderCircle size={20} className="animate-spin"/>Создание чата...</span> : 
          <MessageInputArea handleSubmit={handleSubmit} isPendingOrStreaming={createMutation.isPending} suggestionMsg={message}/>
        }
        {/* дисклеймер */}
        <p className="mt-4 text-center text-[11px] text-[#3f3f3f] leading-relaxed">
          Beavulf может допускать ошибки. Проверяйте важную информацию.
        </p>
      </div>
    </div>
  )
}
