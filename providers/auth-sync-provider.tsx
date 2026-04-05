'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { QUERY_KEYS } from '@/constants/constants'

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    const channel = new BroadcastChannel('auth')
    channel.onmessage = (e) => {
      if (e.data === 'signout') {
        queryClient.clear()
        router.push('/')
      }
      if (e.data === 'signin') {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH, QUERY_KEYS.SESSION] })
        router.push('/')
      }
    }

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear()
        router.push('/')
      }
      if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH, QUERY_KEYS.SESSION] })
        router.push('/')
      }
    })

    return () => {
      channel.close()
      subscription.unsubscribe()
    }
  }, [queryClient, router])

  return <>{children}</>
}