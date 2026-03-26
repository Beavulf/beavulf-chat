import { supabaseServer } from "@/lib/supabase-server";

export const chatRepository = {

    async getAll() {
        const { data, error } = await supabaseServer
            .from("chats")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) { throw error }
        return data
    },

    async createChat(title: string) {
        const { data, error } = await supabaseServer
            .from("chats")
            .insert({ title })
            .select();
        if (error) { throw error }
        return data
    }
}