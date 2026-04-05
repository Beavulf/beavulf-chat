'use client'

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isResOk } from '@/lib/utils';
import type { TAuthSessionResponse } from '@/types/auth-types';
import { useRealtimeChats } from '@/hooks/realtime-chats';
import { API_CONFIG } from '@/config/api-config';
import ChatList from './ChatList';
import TopActions from './TopActions';
import BottomActions from './BottomActions';
import { QUERY_KEYS } from '@/constants/constants';
import { getChats } from '@/fetchers/chats-api';

// вынести
async function checkAuthSession(): Promise<TAuthSessionResponse> {
  const res = await fetch(API_CONFIG.AUTH.ENSURE_SESSION);
  await isResOk(res);
  const data = (await res.json()) as TAuthSessionResponse;
  return data;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // получение чатов
  const { data: authSessionData } = useQuery({
    queryKey: [QUERY_KEYS.AUTH, QUERY_KEYS.SESSION],
    queryFn: checkAuthSession,
    staleTime: 300,
  });

  // подписка реалтайм на чаты
  useRealtimeChats(authSessionData?.user.id);

  // получаем чаты пользователя
  const { data: chats=[], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CHATS],
    queryFn: getChats,
    staleTime: 300,
    enabled: !!authSessionData?.user.id,
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
      <BottomActions collapsed={collapsed} authSessionData={authSessionData}/>

    </aside>
  )
}
