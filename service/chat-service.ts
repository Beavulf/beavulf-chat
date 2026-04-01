import { chatRepository } from "@/repositories/chat-repository";
import { BusinessError } from "@/lib/errors";
import { authService } from "./auth-service";
import { userLimitService } from "./user-limit-service";

export const chatService = {

    // создание чата для пользователя
    async createChat(title: string) {        
        const user = await authService.getUser();
        await userLimitService.ensureCanAskQuestion(user.id);
        const newChat = await chatRepository.createChat(title, user.id);

        return newChat;
    },

    // получение чатов[] текущего пользователя
    async getChatsByUserId() {
        const user = await authService.getUser();
        const chats = await chatRepository.getChatsByUserId(user.id);

        return chats;
    },

    // удаление чата по айди
    async deleteChatById(chatId: string): Promise<void> {
        const chat = await this.getChatById(chatId);
        await chatRepository.deletChatById(chat.id);
        return;
    },

    // переименовать название чата
    async renameChat(newTitle: string, chatId: string): Promise<void> {
        const chat = await this.getChatById(chatId);
        await chatRepository.renameChat(newTitle, chat.id);
        return;
    },

    // получение чата по айди с проверкой доступа к этому чату
    async getChatById(chatId: string) {
        const user = await authService.getUser();
        const userId = user.id;

        const chat = await chatRepository.getChatById(chatId);

        if (!chat) {
            throw new BusinessError("Чат не найден", "NOT_FOUND");
        } 

        if (chat.user_id !== userId) {
            throw new BusinessError("Нет доступа к данному чату", "FORBIDDEN");
        }

        return chat;
    }

}