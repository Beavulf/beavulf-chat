import { BusinessError } from "@/lib/errors";
import { messageRepository } from "@/repositories/message-repository";
import { authService } from "./auth-service";
import { chatService } from "./chat-service";
import { userLimitService } from "./user-limit-service";
import { ERRORS_CODES } from "@/constants/constants";
import type { TMessage, TMessageInsert } from "@/types/db-types";

export const messageService = {

  // создание сообщения
  async createMessage(content: string, role: "user" | "assistant", chatId: string): Promise<TMessageInsert> {
    const user = await authService.getUser();
    const chat = await chatService.getChatById(chatId);

    if (user.id !== chat.user_id) {
      throw new BusinessError("Нет доступа к чату", ERRORS_CODES.FORBIDDEN);
    }

    if (role === "user") {
      await userLimitService.ensureCanAskQuestion(user.id, !!user.is_anonymous);
    }

    const message = await messageRepository.createMessage(content, role, chat.id, user.id);

    if (role === "user" && user.is_anonymous) {
      await userLimitService.incrementQuestions(user.id);
    }

    return message;
  },

  // изменение сообщения с проверкой доступа
  async updateMessageById(messageId: string, content: string): Promise<void> {
    const message = await this.getMessageById(messageId);
    await messageRepository.updateMessageById(message.id, content);

    return;
  },

  // получение сообщений чата
  async getMessagesByChatId(chatId: string): Promise<TMessage[]> {
    const user = await authService.getUser();
    const chat = await chatService.getChatById(chatId);
    
    if (user.id !== chat.user_id) {
      throw new BusinessError("Нет доступа к чату", ERRORS_CODES.FORBIDDEN);
    }
    const messages = await messageRepository.getMessagesByChatId(chat.id);
    
    return messages;
  },

  async getMessageById(messageId: string): Promise<TMessage> {
    const user = await authService.getUser();
    const message = await messageRepository.getMessageById(messageId);

    if (!message) {
      throw new BusinessError("Сообщение не найдено", ERRORS_CODES.NOT_FOUND);
    }
    if (message.user_id !== user.id) {
      throw new BusinessError("Нет доступа к данному сообщению", ERRORS_CODES.FORBIDDEN);
    }

    return message;
  }
}