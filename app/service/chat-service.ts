import { chatRepository } from "../repositories/chat-repository";

export const chatService = {

    async getAllChats() {
        const chats = await chatRepository.getAll()
        return chats;
    },

    async createChatForUser(title: string, userId:string) {
        const finalTitle = title?.trim() || "Новый чат"
        const newChat = await chatRepository.createChat(finalTitle);
        return newChat;
    }
}