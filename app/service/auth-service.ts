import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { supabaseServer } from "@/lib/supabase-server";
import { ANON_SESSION } from "../constants/constants";

export const authService = {

    async signInUser() {
        const { data } = await supabaseServer.auth.signInWithPassword({
            email: "gaga@gmail.com",
            password: "332211"
        });

        return data;
    },

    async signUpUser() {
        const { data: {user} } = await supabaseServer.auth.signUp({
            email: 'gaga@gmail.com',
            password: '332211',
        });

        return user;
    },

    async createAnonUser() {
        const { data: {user}, error } = await supabaseServer.auth.signInAnonymously();
        if (error) {
            throw error;
        }
        return user;
    },

    async getUser() {
        const { data: { user } } = await supabaseServer.auth.getUser();
        
        return user;
    },

    async auth() {
        const user = await this.getUser();
        if (!user) {
            const anonUser = await this.createAnonUser();
            
            return {anonUser}
            // const anonSessiondId = await this.getAnonSessionId();
            // if (!anonSessiondId) {
            //     throw new Error("Ошибка при формировании ID сессии");
            // }
            // return {anonSessiondId};
        }

        return {user};
    },

    async getAnonSessionId(): Promise<string> {
        const coockiesStore = await cookies();
        let sessionId = coockiesStore.get(ANON_SESSION.COOCKIE_NAME)?.value;
        
        if (!sessionId) {
            sessionId = uuidv4();
            coockiesStore.set(ANON_SESSION.COOCKIE_NAME, sessionId, {
                maxAge: ANON_SESSION.MAX_AGE,
                httpOnly: true,
                sameSite: 'lax'
            })
        }

        return sessionId;
    },

    async signOutUser() {
        const {error} = await supabaseServer.auth.signOut();

        if (error) { throw error }

        return;
    } 
}