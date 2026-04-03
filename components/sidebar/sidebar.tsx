'use client'

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isResOk } from '@/lib/utils';
import type { TAuthSessionResponse } from '@/types/auth-types';
import { useRealtimeChats } from '@/hooks/realtime-chats';
import { API_CONFIG } from '@/config/api-config';
import ChatList from './ChatList';
import TopActions from './TopActions';
import BottomActions from './BottomActions';
import { createChat } from '@/fetchers/chats-api';
import { QUERY_KEYS } from '@/constants/constants';

// вынести
async function checkAuthSession(): Promise<TAuthSessionResponse> {
  const res = await fetch(API_CONFIG.AUTH.ENSURE_SESSION);
  const data = (await res.json()) as TAuthSessionResponse;
  await isResOk(res);
  return data;
}

export function Sidebar() {
  const queryClient = useQueryClient()
  const [collapsed, setCollapsed] = useState(false)

  const { data: authSessionData } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: checkAuthSession,
    staleTime: 300,
  });

  useRealtimeChats(authSessionData?.user.id);

  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHATS] })
      // if (newChat?.id) {
      //   router.push(`/chats/${newChat.id}`)
      // }
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
      <TopActions 
        collapsed={collapsed} 
        isPending={createMutation.isPending} 
        onCreate={()=>createMutation.mutate('')}
      />
      {/* Chat list */}
      <ChatList collapsed={collapsed} />
      {/* Bottom actions */}
      <BottomActions collapsed={collapsed} />

    </aside>
  )
}
