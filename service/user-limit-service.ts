import { ANON_SESSION } from "@/constants/constants";
import { userLimitRepository } from "@/repositories/user-limit-repository";

export const userLimitService = {

    async getOrCreatedUserLimit(userId: string) {
        const userLimit = await userLimitRepository.getUserById(userId);

        if (userLimit) return userLimit;

        if (!userLimit) {
            const newUserLimit = await userLimitRepository.createUser(userId);
            
            return newUserLimit;
        }
    },

    async ensureCanAskQuestion(userId: string) {
        const limits = await this.getOrCreatedUserLimit(userId);

        const now = new Date();
        const resetAt = new Date(limits.reset_at);

        if (now > resetAt) {
            const resetLimit = await userLimitRepository.resetLimitIfExpired(userId);

            return resetLimit;
        }

        if (limits.free_q_u >= ANON_SESSION.MESSAGE_LIMIT) {
            throw new Error("FREE_LIMIT_REACHED");
        }

        return limits;
    },

    async incrementQuestions(userId: string) {
        await userLimitRepository.incrementQuestions(userId);
    }
}