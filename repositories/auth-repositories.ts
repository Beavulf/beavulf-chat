import { createClient } from "@/lib/server"
import { DatabaseError } from "@/lib/errors";
import type { Session, User } from "@supabase/supabase-js";

type TSignOut = {
    success: boolean;
}

type TAuthData = {
    user: User | null;
    session: Session | null;
}

export const authRepositories = {

    // авторизация
    async signIn(email: string, password: string):Promise<TAuthData>{
        const supabase = await createClient();

        const { data: {user, session}, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) { 
            throw new DatabaseError(`Ошибка при авторизации пользователя: ${error.message}`);
        }
        
        return {user, session};
    },

    // регистрация
    async signUp(email: string, password: string):Promise<TAuthData> {
        const supabase = await createClient();

        const { data: {user, session}, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw new DatabaseError(`Ошибка при регистрации пользователя: ${error.message}`);
        }

        return {user, session};
    },

    // анонимный вход
    async signInAnon():Promise<TAuthData> {
        const supabase = await createClient();

        const { data: {user, session}, error } = await supabase.auth.signInAnonymously();

        if (error) {
            throw new DatabaseError(`Ошибка при авторизации анонимного пользователя: ${error.message}`);
        }

        return {user, session};
    },

    // получение текущего авторизованного пользователя
    async getUser():Promise<User | null> {
        const supabase = await createClient();

        const { data: {user}, error } = await supabase.auth.getUser();

        if (error) {
            throw new DatabaseError(`Ошибка при получении пользователя: ${error.message}`);
        }

        return user; 
    },

    // получение текущей активной сессии
    async getSession():Promise<Session | null> {
        const supabase = await createClient();

        const { data: {session}, error } = await supabase.auth.getSession();
        
        if (error) {
            throw new DatabaseError(`Ошибка при получении сессии: ${error.message}`);
        }

        return session;
    },

    // деавторизация
    async signOut():Promise<TSignOut> {
        const supabase = await createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new DatabaseError(`Ошибка при выходе пользователя: ${error.message}`);
        }

        return {success: true};
    }
}