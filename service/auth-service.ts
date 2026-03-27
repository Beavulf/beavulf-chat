import { userLimitService } from "./user-limit-service";
import { createClient } from "@/lib/server";

export const authService = {

    async signInUser() {
        const supabase = await createClient();

        const isLogin = await this.getUser();
        
        if (isLogin) {
            return isLogin;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: "gaga@gmail.com",
            password: "332211"
        });
        
        if (error?.message.includes("credentials") || error?.message.includes("invalid_login")) { 
            return {error};
        }

        return data;
    },

    async signUpUser() {
        const supabase = await createClient();

        const { data: {user}, error } = await supabase.auth.signUp({
            email: 'gaga@gmail.com',
            password: '332211',
        });

        if (error) return {error};
        

        return user;
    },

    async createAnonUser() {
        const supabase = await createClient();
        const { data: {user}, error } = await supabase.auth.signInAnonymously();
        
        if (error) { throw error; }

        return user;
    },

    async getUser() {
        const supabase = await createClient();

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) { throw {"Get session error:":sessionError}; }
        
        if (!sessionData.session) {
            return null;
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) { throw {"Get user error":error}; }
        return user;
    },

    async auth() {
        const user = await this.getUser();

        if (!user) {
            const anonUser = await this.createAnonUser();
            const userId = anonUser?.id || "";
            const anonLimit = await userLimitService.getOrCreatedUserLimit(userId);

            return {anonUser};
        }

        const userLimit = await userLimitService.getOrCreatedUserLimit(user.id);
        // const canAsk = await userLimitService.ensureCanAskQuestion(user.id);

        return {user};
    },

    async signOutUser() {
        const supabase = await createClient();

        const isLogin = await this.getUser();

        if (!isLogin) {
            return null;
        }

        const {error} = await supabase.auth.signOut();
        if (error) return {error}
        return 'success';
    } 
}