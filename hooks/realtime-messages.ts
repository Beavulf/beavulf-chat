import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/client";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { QUERY_KEYS } from "@/constants/constants";
import type { TMessage } from "@/types/db-types";

export function useRealtimeMessages(chatId: string) {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!chatId) return;

    const onChange = (payload: RealtimePostgresChangesPayload<TMessage>) => {
      if (payload.eventType === "INSERT" && payload.new) {
        queryClient.setQueryData<TMessage[]>([QUERY_KEYS.MESSAGES, chatId], (old) => [
          payload.new!,
          ...(old ?? []),
        ]);
        return;
      }
      if (payload.eventType === "DELETE" && payload.old) {
        queryClient.setQueryData<TMessage[]>([QUERY_KEYS.MESSAGES, chatId], (old) =>
          (old ?? []).filter((c) => c.id !== payload.old!.id)
        );
        return;
      }
      if (payload.eventType === "UPDATE" && payload.new) {
        queryClient.setQueryData<TMessage[]>([QUERY_KEYS.MESSAGES, chatId], (old) =>
          (old ?? []).map((c) =>
            c.id === payload.new!.id ? payload.new! : c
          )
        );
      }
    };

    const channel = supabase
      .channel(`${QUERY_KEYS.MESSAGES}:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: QUERY_KEYS.MESSAGES,
          filter: `chat_id=eq.${chatId}`,
        },
        onChange
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [chatId, queryClient, supabase]);
}
