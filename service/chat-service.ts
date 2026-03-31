import { chatRepository } from "@/repositories/chat-repository";
import { BusinessError } from "@/lib/errors";
import { authService } from "./auth-service";
import { userLimitService } from "./user-limit-service";

export const chatService = {

    // создание чата для пользователя
    async createChat(title?: string) {
        const user = await authService.getUser();

        if (!user) {
            throw new BusinessError("Пользователь не авторизован", "NOT_AUTHORIZED");
        }

        const userId = user.id;
        await userLimitService.ensureCanAskQuestion(userId);

        const finalTitle = title?.trim() || "Новый чат"

        const newChat = await chatRepository.createChat(finalTitle);

        return newChat;
    },

    // получение чатов текущего пользователя
    async getChatsByUserId() {
        const user = await authService.getUser();

        if (!user) {
            throw new BusinessError("Пользователь не авторизован", "NOT_AUTHORIZED");
        }

        const userId = user.id
        const chats = await chatRepository.getChatsByUserId(userId);

        return chats;
    
    },

    // удаление чата по айди
    async deleteChatById(chatId: string):Promise<void> {
        const user = await authService.getUser();

        if (!user) {
            throw new BusinessError("Пользователь не авторизован", "NOT_AUTHORIZED");
        }

        const chat = await this.getChatById(chatId);

        const userId = user.id;
        if (chat.user_id !== userId) {
            throw new BusinessError("Нет доступа к данному чату", "FORBIDDEN");
        }

        await chatRepository.deletChatById(chatId);
        return;        
    },

    // переименовать название чата
    async renameChat(newTitle: string, chatId: string):Promise<void> {
        const user = await authService.getUser();
        if (!user) {
            throw new BusinessError("Пользователь не авторизован", "NOT_AUTHORIZED");
        }

        const chat = await this.getChatById(chatId);     

        const userId = user.id;
        if (chat.user_id !== userId) {
            throw new BusinessError("Нет доступа к данному чату", "FORBIDDEN");
        }

        const finalTitle = newTitle?.trim() || "Новый чат"

        await chatRepository.renameChat(finalTitle, chatId);
        
        return;
    },

    async getChatById(chatId: string) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) {
            throw new BusinessError("Чат не найден", "CHAT_NOT_FOUND");
        } 

        return chat;
    }

}