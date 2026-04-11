import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, STALE_TIME } from '@/constants/constants'
import { checkAuthSession } from '@/fetchers/auth-api'

export function useSession() {
  const { data, error, isPending } = useQuery({
    queryKey: [QUERY_KEYS.AUTH, QUERY_KEYS.SESSION],
    queryFn: checkAuthSession,
    staleTime: STALE_TIME.SESSION,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false
  })

  return {
    user: data?.user ?? null,
    type: data?.type ?? null,
    isAnon: data?.type === 'anon',
    isLoading: isPending,
    error,
  }
}