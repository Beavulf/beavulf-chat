import { supabaseServer } from "@/lib/supabase-server";
import { DatabaseError } from "@/lib/errors";

export const messageRepository = {
    // создание сообщения
    async createMessage(content: string, role: "user" | "assistant", chatId: string) {
        const { data, error } = await supabaseServer
            .from("messages")
            .insert({
                content,
                role,
                chat_id: chatId
            })
            .select()
            .single();

        if (error) {
            throw new DatabaseError(`Ошибка при создании сообщения: ${error.message}`);
        }

        return data;
    },

    // получение сообщений чата
    async getMessagesByChatId(chatId: string) {
        const { data, error } = await supabaseServer
            .from("messages")
            .select("*")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true });

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
    async getMessageById(messageId: string) {
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