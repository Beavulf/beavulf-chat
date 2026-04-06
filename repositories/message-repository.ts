import { supabaseServer } from "@/lib/supabase-server";
import { DatabaseError } from "@/lib/errors";
import type { TMessage, TMessageInsert } from "@/types/db-types";

export const messageRepository = {
  // создание сообщения
  async createMessage(content: string, role: "user" | "assistant", chatId: string, userId: string): Promise<TMessageInsert> {
    const { data, error } = await supabaseServer
      .from("messages")
      .insert({
        content,
        role,
        chat_id: chatId,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError(`Ошибка при создании сообщения: ${error.message}`);
    }

    return data;
  },

  // получение сообщений чата
  async getMessagesByChatId(chatId: string): Promise<TMessage[]> {
    const { data, error } = await supabaseServer
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(`Ошибка при получении сообщений: ${error.message}`);
    }

    return data;
  },

  // удаление сообщения по айди
  async deleteMessageById(messageId: string): Promise<void> {
    const { error } = await supabaseServer
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      throw new DatabaseError(`Ошибка при удалении сообщения: ${error.message}`);
    }

    return;
  },

  // измнение сообщения
  async updateMessageById(messageId: string, content: string): Promise<void> {
    const { error } = await supabaseServer
      .from("messages")
      .update({ content })
      .eq("id", messageId)
      .single();

    if (error) {
      throw new DatabaseError(`Ошибка при изменении сообщения: ${error.message}`);
    }
    
    return;
  },

  // получение сообщения по его айди
  async getMessageById(messageId: string): Promise<TMessage | null> {
    const { data, error } = await supabaseServer
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) {
      throw new DatabaseError(`Ошибка при получении сообщения: ${error.message}`);
    }

    return data;
  }
}