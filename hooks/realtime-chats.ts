import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/client";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { TChatRowDto } from "@/types/chats-types";

const CHATS_QUERY_KEY = ["chats"] as const;

export function useRealtimeChats(userId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!userId) return;

    const onChange = (payload: RealtimePostgresChangesPayload<TChatRowDto>) => {
      if (payload.eventType === "INSERT" && payload.new) {
        queryClient.setQueryData<TChatRowDto[]>(CHATS_QUERY_KEY, (old) => [
          payload.new!,
          ...(old ?? []),
        ]);
        return;
      }
      if (payload.eventType === "DELETE" && payload.old) {
        queryClient.setQueryData<TChatRowDto[]>(CHATS_QUERY_KEY, (old) =>
          (old ?? []).filter((c) => c.id !== payload.old!.id)
        );
        return;
      }
      if (payload.eventType === "UPDATE" && payload.new) {
        queryClient.setQueryData<TChatRowDto[]>(CHATS_QUERY_KEY, (old) =>
          (old ?? []).map((c) =>
            c.id === payload.new!.id ? payload.new! : c
          )
        );
      }
    };

    const channel = supabase
      .channel(`chats:${userId}`)
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
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient, supabase]);
}
