import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/client";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { UIMessage } from "@ai-sdk/react";
import { QUERY_KEYS } from "@/constants/constants";
import { dbMessageToUIMessage } from "@/lib/utils";
import type { TMessage } from "@/types/db-types";

type SetMessages = (
  messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])
) => void;

export function useRealtimeMessages(
  chatId: string,
  setChatMessages?: SetMessages,
) {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!chatId) return;

    const onChange = (payload: RealtimePostgresChangesPayload<TMessage>) => {
      if (payload.eventType === "INSERT" && payload.new) {
        queryClient.setQueryData<TMessage[]>(
          [QUERY_KEYS.MESSAGES, chatId],
          (old) => {
            // Проверка на дубликаты по id
            if (old?.some((msg) => msg.id === payload.new!.id)) {
              return old;
            }
            return [payload.new!, ...(old ?? [])];
          }
        );

        // Синхронизируем useChat стейт
          setChatMessages?.((prev) => {
            const newMsg = dbMessageToUIMessage(payload.new!);
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Проверка: текст нового сообщения не совпадает с текстом последнего старого
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.parts && newMsg.parts) {
              const lastText = lastMsg.parts.map(p => p.type === 'text' ? p.text : '').join('');
              const newText = newMsg.parts.map(p => p.type === 'text' ? p.text : '').join('');
              if (lastText === newText) return prev;
            }
            return [...prev, newMsg];
          });
  
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
      .subscribe((status)=>{
        if (status === "CHANNEL_ERROR") {
          console.error("Ошибка при подписке на канал")
        }
      });

    return () => { void supabase.removeChannel(channel); };
  }, [chatId, queryClient, supabase, setChatMessages]);
}