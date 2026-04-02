import { BusinessError } from "@/lib/errors";
import { messageRepository } from "@/repositories/message-repository";
import { authService } from "./auth-service";
import { chatService } from "./chat-service";
import { userLimitService } from "./user-limit-service";
import { ERRORS_CODES } from "@/constants/constants";

export const messageService = {
    // создание сообщения
    async createMessage(content: string, role: "user" | "assistant", chatId: string) {
        const user = await authService.getUser();
        const chat = await chatService.getChatById(chatId);

        if (role === "user") {
            await userLimitService.ensureCanAskQuestion(user.id, !!user.is_anonymous);
        }

        const message = await messageRepository.createMessage(content, role, chat.id);

        if (role === "user") {
            await userLimitService.incrementQuestions(user.id);
        }

        return message;
    },

    // изменение сообщения с проверкой доступа
    async updateMessageById(messageId: string, content: string): Promise<void> {
        const user = await authService.getUser();
        const message = await messageRepository.getMessageById(messageId);

        if (!message) {
            throw new BusinessError("Сообщение не найдено", ERRORS_CODES.NOT_FOUND);
        }

        if (message.user_id !== user.id) {
            throw new BusinessError("Нет доступа к данному сообщению", ERRORS_CODES.FORBIDDEN);
        }

        await messageRepository.updateMessageById(message.id, content);

        return;
    },

    // получение сообщений чата
    async getMessagesByChatId(chatId: string) {
        const chat = await chatService.getChatById(chatId);
        const messages = await messageRepository.getMessagesByChatId(chat.id);
        return messages;
    },
}