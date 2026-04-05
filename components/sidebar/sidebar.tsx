'use client'

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeChats } from '@/hooks/realtime-chats';
import ChatList from './ChatList';
import TopActions from './TopActions';
import BottomActions from './BottomActions';
import { QUERY_KEYS } from '@/constants/constants';
import { getChats } from '@/fetchers/chats-api';
import { useSession } from '@/hooks/use-session';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { user } = useSession();

  // подписка реалтайм на чаты
  useRealtimeChats();

  // получаем чаты пользователя
  const { data: chats=[], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CHATS, user?.id],
    queryFn: getChats,
    staleTime: 300*60*1000,
    enabled: !!user?.id,
  })

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        'relative flex flex-col h-full bg-[#171717] transition-all duration-300 ease-in-out select-none shrink-0',
        collapsed ? 'w-[60px]' : 'w-[260px]'
      )}
    >
      {/* Кнопка сворачивания бокового меню */}
      <button
        data-testid="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2f2f2f] border border-[#3f3f3f] text-[#8e8ea0] hover:text-white hover:bg-[#3f3f3f] transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Top actions */}
      <TopActions collapsed={collapsed} />

      {/* Chat list */}
      <ChatList
        chats={chats}
        isLoading={isLoading}
        collapsed={collapsed}
      />

      {/* Bottom actions */}
      <BottomActions collapsed={collapsed} />

    </aside>
  )
}
