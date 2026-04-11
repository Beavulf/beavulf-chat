// для масштабирования 

import { fileRepository } from "@/repositories/file-repository"
import type { TMessageFile, TMessageFileInsert } from "@/types/db-types";
import { authService } from "./auth-service";
import { messageService } from "./message-service";
import { BusinessError } from "@/lib/errors";
import { ERRORS_CODES } from "@/constants/constants";
import { randomUUID } from "crypto";

const BUCKET = 'chat-documents';

export const fileService = {

  async uploadFile(
    { path, type, buffer }:
    { path: string, type: string, buffer: Buffer }
  ){
    const user = await authService.getUser();
    if (user.id !== path.split('/')[0]) {
      throw new BusinessError('Нет доступа к загрузке файла', ERRORS_CODES.FORBIDDEN)
    }

    const exists = await fileRepository.fileExistsInStorage(path);
    if (exists) {
      throw new BusinessError('Файл уже существует в хранилище', ERRORS_CODES.ALREADY_EXISTS)
    }
    const fileData = await fileRepository.uploadFile({path, type, buffer});

    return fileData;
  },

  async uploadTempFileAndGetSignedUrl(file: File): Promise<{ url: string; name: string; type: string; path: string }> {
    const user = await authService.getUser();

    const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, '-');
    const path = `${user.id}/tmp/${randomUUID()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await this.uploadFile({ path, type: file.type, buffer });

    const signedUrl = await this.createSignedUrl(path);
    if (!signedUrl) {
      await this.deleteFileInStorage(path);
      throw new BusinessError('Не удалось создать подписанную ссылку', ERRORS_CODES.NOT_FOUND);
    }

    return { url: signedUrl, name: file.name, type: file.type, path };
  },

  async insertMessageFileData(file: TMessageFileInsert) {
    await messageService.getMessageById(file.message_id);
    const fileData = await fileRepository.insertMessageFileData(file);

    return fileData;
  },

  async createSignedUrl(path: string) {
    const user = await authService.getUser();
    if (user.id !== path.split('/')[0]) {
      throw new BusinessError('Нет доступа к загрузке файла', ERRORS_CODES.FORBIDDEN)
    }
    const storageFile = await fileRepository.fileExistsInStorage(path);
    if (!storageFile) {
      throw new BusinessError('Файла не существует', ERRORS_CODES.NOT_FOUND)
    }
    const signedUrl = await fileRepository.createSignedUrl(path);
    
    return signedUrl;
  },

  // получение даных файла, проверка доступ к нему
  async getMessageFileData(id: string): Promise<TMessageFile> {
    const fileData = await fileRepository.getMessageFileData(id);
    if (!fileData) {
      throw new BusinessError('Данные файла не найдены', ERRORS_CODES.NOT_FOUND)
    }
    await messageService.getMessageById(fileData.message_id); //?

    return fileData;
  },

  async deleteMessageFileData(id: string): Promise<void> {
    const fileData = await this.getMessageFileData(id);
    await messageService.getMessageById(fileData.message_id); //?
    await fileRepository.deleteMessageFileData(fileData.id);

    return;
  },

  async deleteFileInStorage(path: string): Promise<void> {
    const user = await authService.getUser();
    if (user.id !== path.split('/')[0]) {
      throw new BusinessError('Нет доступа к загрузке файла', ERRORS_CODES.FORBIDDEN)
    }
    const exists = await fileRepository.fileExistsInStorage(path);
    if (!exists) {
      throw new BusinessError('Файл в хранилище не найден', ERRORS_CODES.NOT_FOUND)
    }
    await fileRepository.deleteFileInStorage(path);
    return;
  },
  
  // прикрепления файла к сообщению, с загрузкой в хранилище и в таблицу данных
  async attachFileToMessage(messageId: string, file: File): Promise<TMessageFileInsert> {
    const user = await authService.getUser();

    const message = await messageService.getMessageById(messageId);
    if (!message) {
      throw new BusinessError('Сообщение для прикрепления файла не найдено', ERRORS_CODES.NOT_FOUND)
    }

    if (message.user_id !== user.id) {
      throw new BusinessError('Нет доступа к сообщению', ERRORS_CODES.FORBIDDEN);
    }

    const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, '-');
    const path = `${user.id}/${message.chat_id}/${messageId}/${randomUUID()}${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storageFile = await this.uploadFile({
      path: path,
      type: file.type,
      buffer: buffer,
    });

    if (!storageFile) {
      throw new BusinessError('Файл не записан в хранилище', ERRORS_CODES.NOT_FOUND);
    }

    const messageFileData = await fileService.insertMessageFileData({
      message_id: messageId,
      bucket: BUCKET,
      original_name: file.name,
      storage_path: path,
      type: file.type
    });

    if (!messageFileData) {
      await this.deleteFileInStorage(path);
      throw new BusinessError('Файл не приписан сообщению', ERRORS_CODES.NOT_FOUND);
    }

    return messageFileData;
  }
}