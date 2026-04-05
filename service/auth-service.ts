import { userLimitService } from "./user-limit-service";
import { authRepositories } from "@/repositories/auth-repositories";
import { BusinessError } from "@/lib/errors";
import type { User } from "@supabase/supabase-js";
import { ERRORS_CODES } from "@/constants/constants";
import type { TAuthSession } from "@/types/auth-types";

export const authService = {

    // авторизация полльзоватедя с проверкой на активную сессию
    async signInUser(email: string, password: string):Promise<User | null>{
      const currentSession = await authRepositories.getSession();
      if (currentSession) {
        if (currentSession.user.is_anonymous) {
          await authRepositories.signOut();
        }
        else {
          throw new BusinessError("Пользователь уже авторизован", ERRORS_CODES.ALREADY_AUTHORIZED);
        }
      }
      const { user } = await authRepositories.signIn(email, password);

      return user;
    },

    // ргестрация пользователя
    async signUpUser():Promise<User | null> {
      const currentSession = await authRepositories.getSession();
      if (currentSession) {
        throw new BusinessError("Пользователь уже авторизован", ERRORS_CODES.ALREADY_AUTHORIZED);
      }
      const {user} = await authRepositories.signUp(); 

      return user;
    },

    // авторизация анонимного пользователя
    async createAnonUser():Promise<User | null> {
      const currentSession = await authRepositories.getSession();
      if (currentSession) {
        return null;
      }
      const {user} = await authRepositories.signInAnon();

      return user;
    },

    // текущий авторизованный пользователь
    async getUser():Promise<User>{
      const currentSession = await authRepositories.getSession();
      if (!currentSession) {
        throw new BusinessError("Пользователь не авторизован", ERRORS_CODES.NOT_AUTHORIZED);
      }

      const user = await authRepositories.getUser();
      if (!user) {
        throw new BusinessError("Пользователь не найден", ERRORS_CODES.USER_NOT_FOUND);
      }

      return user;
    },


    // проверка пользователя на авторизацию при заходе на страницу || создание анонимной учетки
    async ensureSession(): Promise<{user: User, type: TAuthSession}> {
      const currentSession = await authRepositories.getSession();

      if (!currentSession) {
        const anonUser = await this.createAnonUser();

        if (!anonUser) {
          throw new BusinessError("Не удалось создать анонимного пользователя", ERRORS_CODES.ANON_USER_CREATION_FAILED);
        }

        const userId = anonUser.id;
        await userLimitService.getOrCreatedUserLimit(userId);

        return {user: anonUser, type: "anon"};
      }

      const user = await authRepositories.getUser();

      if (!user) {
        throw new BusinessError("Пользователь не найден", ERRORS_CODES.USER_NOT_FOUND);
      }

      await userLimitService.getOrCreatedUserLimit(user.id);

      return {user, type: "user"};
    },

    // деавторизация пользователя
    async signOutUser():Promise<boolean> {
      const currentSession = await authRepositories.getSession();
      if (!currentSession) {
        throw new BusinessError("Пользователь не авторизован", ERRORS_CODES.NOT_AUTHORIZED);
      }
      const {success} = await authRepositories.signOut();
      
      return success;
    } 
}