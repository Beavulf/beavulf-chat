import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/constants'
import { checkAuthSession } from '@/fetchers/auth-api'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useSession() {
  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.AUTH, QUERY_KEYS.SESSION],
    queryFn: checkAuthSession,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (error) toast.error('Не удалось получить пользователя')
  }, [error])

  return {
    user: data?.user ?? null,
    type: data?.type ?? null,
    isAnon: data?.type === 'anon',
    isLoading,
    error,
  }
}