import { ANON_SESSION } from "@/constants/constants";
import { supabaseServer } from "@/lib/supabase-server";

export const userLimitRepository = {
    async getUserById(userId: string) {
        const { data, error } = await supabaseServer
            .from("user_limits")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (error?.code === "PGRST116") {
            return null;
        }
        if (error) { throw new Error(`DB get user error: ${error}`) }
        console.log('user founded');

        return data;
    },

    async createUser(userId: string) {
        const { data, error } = await supabaseServer
            .from("user_limits")
            .insert({ 
                user_id: userId,
                reset_at: new Date(new Date().getTime() + ANON_SESSION.RESET_AT).toISOString(),
            })
            .select()
            .single();
        if (error) { throw { "create_user":error} }
        console.log('user created');
        return data;
    },

    async resetLimitIfExpired(userId: string) {
        const now = new Date();
        const { data, error } = await supabaseServer
            .from("user_limits")
            .update({
                free_q_u: 0,
                reset_at: new Date(now.getTime() + ANON_SESSION.RESET_AT).toISOString()
             })
            .eq("user_id", userId)
            .select()
            .single();
        if (error) { throw { "reset_limit":error } }
        console.log('reset limit');
        return data;
    },

    async incrementQuestions(userId: string) {
        const { error } = await supabaseServer.rpc('increment_user_questions', {
          p_user_id: userId,
        });
        if (error) { throw { "increment_questions":error } }
        console.log('increment questions');
        return;
    },
}