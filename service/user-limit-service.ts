import { ANON_SESSION } from "@/constants/constants";
import { userLimitRepository } from "@/repositories/user-limit-repository";
import { BusinessError } from "@/lib/errors";

export const userLimitService = {

    // получить лимит юзера
    async getLimitByUserId(userId: string) {
        const userLimit = await userLimitRepository.getLimitByUserId(userId);

        return userLimit;
    },

    // получить лимит или создать новый
    async getOrCreatedUserLimit(userId: string) {
        const userLimit = await this.getLimitByUserId(userId);

        if (userLimit) return userLimit;

        const newUserLimit = await userLimitRepository.createUserLimit(userId);
        return newUserLimit;
    },

    // может ли задавать вопросы
    async ensureCanAskQuestion(userId: string):Promise<void> {
        const limits = await this.getOrCreatedUserLimit(userId);

        const now = new Date();
        const resetAt = new Date(limits.reset_at);

        if (now > resetAt) {
            await userLimitRepository.resetLimitIfExpired(userId);
            return;
        }

        if (limits.free_q_u >= ANON_SESSION.MESSAGE_LIMIT) {
            throw new BusinessError("Привышен лимит бесплатных вопросов","MESSAGE_LIMIT_EXCEEDED");
        }

        return;
    },

    // увеличение кол-во заданных вопросов
    async incrementQuestions(userId: string) {
        await userLimitRepository.incrementQuestions(userId);
    }
}