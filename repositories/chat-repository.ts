import { supabaseServer } from "@/lib/supabase-server";
import { DatabaseError } from "@/lib/errors";
import type { TChat } from "@/types/db-types";
import { QUERY_KEYS } from "@/constants/constants";

export const chatRepository = {

  async getChatsByUserId(userId: string): Promise<TChat[]> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.CHATS)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) { 
        throw new DatabaseError(`Ошибка при получении чатов пользователя: ${error.message}`);
    }

    return data;
  },

  async createChat(title: string, userId: string): Promise<TChat> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.CHATS)
      .insert({ title, user_id: userId })
      .select()
      .single();
    
    if (error) {
      throw new DatabaseError(`Ошибка при создании чата: ${error.message}`);
    }

    return data;
  },

  async deleteChatById(chatId: string):Promise<void> {
    const { error } = await supabaseServer
      .from(QUERY_KEYS.CHATS)
      .delete()
      .eq("id", chatId);

    if (error) {
      throw new DatabaseError(`Ошибка при удалении чата пользователя: ${error.message}`);
    }

    return;
  },

  async renameChat(newTitle: string, chatId: string): Promise<TChat> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.CHATS)
      .update({ title: newTitle })
      .select()
      .eq("id", chatId)
      .single();

    if (error) {
      throw new DatabaseError(`Ошибка при изменении названия чата: ${error.message}`);
    }

    return data;
  },

  // получение чата по айди
  async getChatById(chatId: string): Promise<TChat | null> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.CHATS)
      .select("*")
      .eq("id", chatId)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) {
      throw new DatabaseError(`Ошибка при получении чата: ${error.message}`);
    }

    return data;
  },
}