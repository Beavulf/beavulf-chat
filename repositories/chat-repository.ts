import { supabaseServer } from "@/lib/supabase-server";
import { DatabaseError } from "@/lib/errors";

export const chatRepository = {

    async getChatsByUserId(userId: string) {
        const { data, error } = await supabaseServer
            .from("chats")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) { 
            throw new DatabaseError(`Ошибка при получении чатов пользователя: ${error.message}`);
        }

        return data;
    },

    async createChat(title: string, userId: string) {
        const { data, error } = await supabaseServer
            .from("chats")
            .insert({ title, user_id: userId })
            .select()
            .single();
        
        if (error) {
            throw new DatabaseError(`Ошибка при создании чата: ${error.message}`);
        }

        return data;
    },

    async deletChatById(chatId: string):Promise<void> {
        const { error } = await supabaseServer
            .from("chats")
            .delete()
            .eq("id", chatId);

        if (error) {
            throw new DatabaseError(`Ошибка при удалении чата пользователя: ${error.message}`);
        }

        return;
    },

    async renameChat(newTitle: string, chatId: string) {
        const { data, error } = await supabaseServer
            .from("chats")
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
    async getChatById(chatId: string) {
        const { data, error } = await supabaseServer
            .from("chats")
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