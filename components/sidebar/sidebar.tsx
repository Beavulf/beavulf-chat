'use client'

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isResOk } from '@/lib/utils';
import type { TChatRowDto } from '@/types/chats-types';
import type { TAuthSessionResponse } from '@/types/auth-types';
import { useRealtimeChats } from '@/hooks/realtime-chats';
import { API_CONFIG } from '@/config/api-config';
import ChatList from './ChatList';
import TopActions from './TopActions';
import BottomActions from './BottomActions';

// вынести
async function checkAuthSession(): Promise<TAuthSessionResponse> {
  const res = await fetch(API_CONFIG.AUTH.ENSURE_SESSION);
  const data = (await res.json()) as TAuthSessionResponse;
  await isResOk(res);
  return data;
}

async function deleteChat(chatId: string):Promise<void> {
  const res = await fetch(API_CONFIG.CHATS.DELETE.replace(':id', chatId), {
    method: 'DELETE',
  });
  await isResOk(res);
  return;
}

// получение чатов пользователя авторизованного
async function getChats():Promise<TChatRowDto[]> {
  const res = await fetch(API_CONFIG.CHATS.GET);
  await isResOk(res); 
  const { chats } = await res.json()
  return chats;
}

async function createChat():Promise<TChatRowDto> {
  const res = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Новый чат' }),
  })
  const data = (await res.json()) as TChatRowDto;
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

  const { data: chats=[], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
  })
  console.log(chats);

  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      // if (newChat?.id) {
      //   router.push(`/chats/${newChat.id}`)
      // }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
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
        onCreate={createMutation.mutate}
      />
      {/* Chat list */}
      <ChatList 
        isLoading={isLoading} 
        collapsed={collapsed} 
        chats={chats} 
        onDelete={(id: string)=> deleteMutation.mutate(id)}
      />
      {/* Bottom actions */}
      <BottomActions collapsed={collapsed}/>

    </aside>
  )
}
