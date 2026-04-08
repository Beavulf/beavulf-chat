import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/client";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { UIMessage } from "@ai-sdk/react"; // или твой тип
import { QUERY_KEYS } from "@/constants/constants";
import { dbMessageToUIMessage } from "@/lib/utils";
import type { TMessage } from "@/types/db-types";

type SetMessages = (
  messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])
) => void;

export function useRealtimeMessages(
  chatId: string,
  setChatMessages?: SetMessages,
  currentUserId?: string
) {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!chatId) return;

    const onChange = (payload: RealtimePostgresChangesPayload<TMessage>) => {
      if (payload.eventType === "INSERT" && payload.new) {
        // Обновляем React Query кэш
        queryClient.setQueryData<TMessage[]>(
          [QUERY_KEYS.MESSAGES, chatId],
          (old) => [payload.new!, ...(old ?? [])]
        );

        // Синхронизируем useChat стейт
        const isOwnMessage = payload.new.sender_id === currentUserId;
    if (!isOwnMessage) {
      setChatMessages?.((prev) => {
        if (prev.some((m) => m.id === payload.new!.id)) return prev;
        return [...prev, dbMessageToUIMessage(payload.new!)];
      });
    }
        return;
      }

      if (payload.eventType === "UPDATE" && payload.new) {
        queryClient.setQueryData<TMessage[]>(
          [QUERY_KEYS.MESSAGES, chatId],
          (old) => (old ?? []).map((c) => c.id === payload.new!.id ? payload.new! : c)
        );
        setChatMessages?.((prev) =>
          prev.map((m) =>
            m.id === payload.new!.id ? dbMessageToUIMessage(payload.new!) : m
          )
        );
        return;
      }

      if (payload.eventType === "DELETE" && payload.old) {
        queryClient.setQueryData<TMessage[]>(
          [QUERY_KEYS.MESSAGES, chatId],
          (old) => (old ?? []).filter((c) => c.id !== payload.old!.id)
        );
        setChatMessages?.((prev) =>
          prev.filter((m) => m.id !== payload.old!.id)
        );
      }
    };

    const channel = supabase
      .channel(`${QUERY_KEYS.MESSAGES}:${chatId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: QUERY_KEYS.MESSAGES,
        filter: `chat_id=eq.${chatId}`,
      }, onChange)
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [chatId, queryClient, supabase, setChatMessages]);
}