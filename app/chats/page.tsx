'use client'

import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

async function fetchChats() {
  const res = await fetch('/api/chats')
  if (!res.ok) throw new Error('Failed to load')
  return res.json()
}

async function createChat() {
  const res = await fetch('/api/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'New chat' }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to create chat')
  }
  return data
}

export default function ChatsPage() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data, isLoading, error } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
  })

  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      const newChat = Array.isArray(data) ? data[0] : data
      console.log(newChat);
      
      // if (newChat?.id) {
      //   router.push(`/chats/${newChat.id}`)
      // }
    },
    onError: (error) => {
      console.error('Failed to create chat:', error)
    },
  })

  if (isLoading) return <div>Loading chats...</div>
  if (error) return <div>Error loading chats</div>

  return (
    <div>
      {data.length === 0 && <div>No chats yet</div>}
      <Button 
        onClick={() => createMutation.mutate()}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create chat'}
      </Button>
      <ul>
        {data.map((chat: any) => (
          <li key={chat.id}>{chat.title ?? 'Без названия'}</li>
        ))}
      </ul>
    </div>
  )
}
