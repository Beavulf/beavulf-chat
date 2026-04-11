'use client'

import { QUERY_KEYS } from "@/constants/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut, signUp } from "@/fetchers/auth-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiError } from "next/dist/server/api-utils";
import { AppError } from "@/lib/errors";

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
    retry: false,
    onSuccess: () => {
      invalidateSession();
      router.push('/');
    },
  });

  const signOutUser = useMutation({
    mutationFn: signOut,
    retry: false,
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
      router.refresh();
    },
  });

  const signUpUser = useMutation({
    mutationFn: signUp,
    retry: false,
    onSuccess: () => {
      invalidateSession();
      router.push('/');
    },
  })

  return { signInUser, signOutUser, signUpUser }
}