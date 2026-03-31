import { ANON_SESSION } from "@/constants/constants";
import { supabaseServer } from "@/lib/supabase-server";
import { DatabaseError } from "@/lib/errors";

export const userLimitRepository = {

    async getLimitByUserId(userId: string) {
        const { data, error } = await supabaseServer
            .from("user_limits")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) { 
            throw new DatabaseError(`Ошибка при получении лимита пользователя: ${error.message}`);
        }

        return data;
    },

    // создание лимита для полльзователя
    async createUserLimit(userId: string) {
        const { data, error } = await supabaseServer
            .from("user_limits")
            .insert({ 
                user_id: userId,
                reset_at: new Date(Date.now() + ANON_SESSION.RESET_AT).toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw new DatabaseError(`Ошибка при создании лимита для пользователя: ${error.message}`);
        }
        
        return data;
    },

    // обновление лимита
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

        if (error) {
            throw new DatabaseError(`Ошибка при обновлении лимита пользователя: ${error.message}`);
        }
        
        return data;
    },

    // увеличение счетчика бесплатных вопросов
    async incrementQuestions(userId: string):Promise<void> {
        const { error } = await supabaseServer.rpc('increment_user_questions', {
          p_user_id: userId,
        });
        
        if (error) {
            throw new DatabaseError(`Ошибка при увеличении счетчика бесплатных вопросов: ${error.message}`);
        }

        return;
    },
}