import { chatRepository } from "@/repositories/chat-repository";
import { BusinessError } from "@/lib/errors";
import { authService } from "./auth-service";
import { userLimitService } from "./user-limit-service";
import { ERRORS_CODES } from "@/constants/constants";
import type { TChat } from "@/types/db-types";

export const chatService = {

  // создание чата для пользователя
  async createChat(title: string): Promise<TChat> {        
    const user = await authService.getUser();
    await userLimitService.ensureCanAskQuestion(user.id, !!user.is_anonymous);
    const newChat = await chatRepository.createChat(title, user.id);

    return newChat;
  },

  // получение чатов[] текущего пользователя
  async getChatsByUserId(): Promise<TChat[]> {
    const user = await authService.getUser();
    const chats = await chatRepository.getChatsByUserId(user.id);

    return chats;
  },

  // удаление чата по айди
  async deleteChatById(chatId: string): Promise<void> {
    const chat = await this.getChatById(chatId);
    await chatRepository.deleteChatById(chat.id);
    return;
  },

  // переименовать название чата
  async renameChat(newTitle: string, chatId: string): Promise<void> {
    const chat = await this.getChatById(chatId);
    await chatRepository.renameChat(newTitle, chat.id);
    return;
  },

  // получение чата по айди с проверкой доступа к этому чату
  async getChatById(chatId: string): Promise<TChat> {
    const user = await authService.getUser();
    const userId = user.id;
    const chat = await chatRepository.getChatById(chatId);

    if (!chat) {
      throw new BusinessError("Чат не найден", ERRORS_CODES.NOT_FOUND);
    } 

    if (chat.user_id !== userId) {
      throw new BusinessError("Нет доступа к данному чату", ERRORS_CODES.FORBIDDEN);
    }

    return chat;
  }

}