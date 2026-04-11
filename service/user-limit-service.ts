import { ANON_SESSION } from "@/constants/constants";
import { userLimitRepository } from "@/repositories/user-limit-repository";
import { BusinessError } from "@/lib/errors";
import { ERRORS_CODES } from "@/constants/constants";
import type { TUserLimit } from "@/types/db-types";

export const userLimitService = {

  // получить лимит юзера
  async getLimitByUserId(userId: string): Promise<TUserLimit | null> {
    const userLimit = await userLimitRepository.getLimitByUserId(userId);
    return userLimit;
  },

  // получить лимит или создать новый
  async getOrCreatedUserLimit(userId: string): Promise<TUserLimit> {
    const userLimit = await this.getLimitByUserId(userId);
    if (userLimit) return userLimit;
    const newUserLimit = await userLimitRepository.createUserLimit(userId);

    return newUserLimit;
  },

  // может ли задавать вопросы
  async ensureCanAskQuestion(userId: string, isAnon: boolean): Promise<void> {
    const limits = await this.getOrCreatedUserLimit(userId);

    const now = new Date();
    const resetAt = new Date(limits.reset_at);

    if (now > resetAt) {
      await userLimitRepository.resetLimitIfExpired(userId);
    }

    if (isAnon && (limits?.free_q_u ?? 0) >= ANON_SESSION.MESSAGE_LIMIT) {
      throw new BusinessError("Превышен лимит бесплатных вопросов", ERRORS_CODES.MESSAGE_LIMIT_EXCEEDED);
    }

    return;
  },

  // увеличение кол-во заданных вопросов
  async incrementQuestions(userId: string): Promise<void> {
    await userLimitRepository.incrementQuestions(userId);
  }
}