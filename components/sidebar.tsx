'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, SquarePen, Trash2, LogIn, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Chat {
  id: string
  title: string
  created_at: string
}

async function fetchChats() {
  const res = await fetch('/api/chats');
  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  }
  const data = await res.json()
  return data.chats;
}

async function createChat() {
  const res = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Новый чат' }),
  })
  const data = await res.json()
  if (!res.ok) {
    const body = await res.json()
    throw Object.assign(new Error(body.error), { code: body.code })
  }  
  return Array.isArray(data) ? data[0] : data
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [collapsed, setCollapsed] = useState(false)

  const { data: chats=[], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
  })
console.log(chats);

  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      if (newChat?.id) {
        router.push(`/chats/${newChat.id}`)
      }
    },
  });

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        'relative flex flex-col h-full bg-[#171717] transition-all duration-300 ease-in-out select-none shrink-0',
        collapsed ? 'w-[60px]' : 'w-[260px]'
      )}
    >
      {/* Toggle collapse button */}
      <button
        data-testid="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2f2f2f] border border-[#3f3f3f] text-[#8e8ea0] hover:text-white hover:bg-[#3f3f3f] transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Top actions */}
      <div className={cn('flex items-center gap-1 p-3 pt-4', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#2f2f2f] transition-colors">
            {/* Beavulf SVG Logo */}
            <svg
              aria-label="Beavulf Chat"
              viewBox="0 0 28 28"
              fill="none"
              className="w-6 h-6 shrink-0"
            >
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" className="text-white/80" />
              <path
                d="M8 19V9h5.5a3.5 3.5 0 0 1 0 7H8M13.5 16H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              />
            </svg>
            <span className="text-white font-semibold text-sm tracking-tight">Beavulf</span>
          </Link>
        )}

        {collapsed && (
          <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#2f2f2f] transition-colors">
            <svg aria-label="Beavulf Chat" viewBox="0 0 28 28" fill="none" className="w-5 h-5">
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" className="text-white/80" />
              <path d="M8 19V9h5.5a3.5 3.5 0 0 1 0 7H8M13.5 16H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
            </svg>
          </Link>
        )}

        <button
          data-testid="button-new-chat"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className={cn(
            'flex items-center justify-center rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-colors',
            collapsed ? 'w-9 h-9' : 'w-9 h-9'
          )}
          title="Новый чат"
        >
          <SquarePen size={18} />
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-thin">
        {!collapsed && (
          <div className="px-2 py-1 mb-1">
            <p className="text-xs font-medium text-[#8e8ea0] uppercase tracking-wider">Чаты</p>
          </div>
        )}

        {isLoading && !collapsed && (
          <div className="space-y-1 px-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg bg-[#2f2f2f]" />
            ))}
          </div>
        )}

        {!isLoading && chats.length === 0 && !collapsed && (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <MessageSquare size={28} className="text-[#3f3f3f] mb-2" />
            <p className="text-xs text-[#4a4a4a]">Нет чатов</p>
            <p className="text-xs text-[#3f3f3f] mt-0.5">Начните новый разговор</p>
          </div>
        )}

        <nav className="space-y-0.5">
          {chats.map((chat) => {
            const isActive = pathname === `/chats/${chat.id}`
            return (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                data-testid={`link-chat-${chat.id}`}
                title={chat.title}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-[#2f2f2f] text-white'
                    : 'text-[#acacac] hover:bg-[#212121] hover:text-white',
                  collapsed && 'justify-center px-0'
                )}
              >
                <MessageSquare size={16} className="shrink-0" />
                {!collapsed && (
                  <span className="truncate flex-1 text-[13.5px]">{chat.title}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom: auth */}
      <div className={cn('border-t border-[#2f2f2f] p-3', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <Link
            href="/auth/login"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-colors"
            title="Войти"
          >
            <User size={18} />
          </Link>
        ) : (
          <Link
            href="/auth/login"
            data-testid="link-login"
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-[#acacac] hover:bg-[#2f2f2f] hover:text-white transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f2f2f] border border-[#3f3f3f] shrink-0">
              <User size={15} className="text-[#8e8ea0]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#d1d1d1] truncate">Войти</span>
              <span className="text-[11px] text-[#5a5a5a] truncate">или создать аккаунт</span>
            </div>
            <LogIn size={14} className="ml-auto shrink-0 text-[#5a5a5a]" />
          </Link>
        )}
      </div>
    </aside>
  )
}
