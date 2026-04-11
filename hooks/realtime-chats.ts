import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/client";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { QUERY_KEYS } from "@/constants/constants";
import type { TChat } from "@/types/db-types";
import { useSession } from "./use-session";

export function useRealtimeChats() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const supabase = useMemo(() => createClient(), []);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const onChange = (payload: RealtimePostgresChangesPayload<TChat>) => {
      if (payload.eventType === "INSERT" && payload.new) {
        queryClient.setQueryData<TChat[]>([QUERY_KEYS.CHATS, userId], (old) => {
          // Проверяем, нет ли уже чата с таким id
          if (old?.some(chat => chat.id === payload.new!.id)) {
            return old;
          }
          return [payload.new!, ...(old ?? [])];
        });

        return;
      }
      if (payload.eventType === "DELETE" && payload.old) {
        queryClient.setQueryData<TChat[]>([QUERY_KEYS.CHATS, userId], (old) =>
          (old ?? []).filter((c) => c.id !== payload.old!.id)
        );
        return;
      }
      if (payload.eventType === "UPDATE" && payload.new) {
        queryClient.setQueryData<TChat[]>([QUERY_KEYS.CHATS, userId], (old) =>
          (old ?? []).map((c) =>
            c.id === payload.new!.id ? payload.new! : c
          )
        );
      }
    };

    const channel = supabase
      .channel(`${QUERY_KEYS.CHATS}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `user_id=eq.${userId}`,
        },
        onChange
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Ошибка при подписке на канал чата")
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);
}
