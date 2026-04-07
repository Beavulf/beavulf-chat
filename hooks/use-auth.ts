import { QUERY_KEYS } from "@/constants/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut, signUp } from "@/fetchers/auth-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const invalidateSession = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.AUTH, QUERY_KEYS.SESSION]
    })
  }
  
  const signInUser = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      invalidateSession();
      router.push('/');
    },
    onError: () => {
      toast.error('Неверные данные для входа');
    }
  });

  const signOutUser = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      router.push('/')
      router.refresh();
    },
    onError: () => {
      toast.error('Ошибка при выходе');
    }
  });

  const signUpUser = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      invalidateSession();
      router.push('/');
    },
    onError: () => {
      toast.error('Ошибка при регистрации');
    }
  })

  return { signInUser, signOutUser, signUpUser }
}