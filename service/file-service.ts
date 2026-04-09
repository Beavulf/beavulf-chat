import { fileRepository } from "@/repositories/file-repository"
import type { TMessageFile, TMessageFileInsert } from "@/types/db-types";
import { get } from "http";

export const fileService = {

  async uploadFile({
    path, type, buffer
  }:
  {
    path: string, type: string, buffer: Buffer
  }){
    const fileData = await fileRepository.uploadFile({path, type, buffer});

    return fileData;
  },

  async insertToFileTable(file: TMessageFileInsert) {
    const fileData = await fileRepository.insertToFileTable(file);
    console.log(fileData);

    return fileData;
  },

  async createSignedUrl(path: string) {
    const signedUrl = await fileRepository.createSignedUrl(path);

    return signedUrl;
  },

  async getFileMessage(id: string): Promise<TMessageFile | null> {
    const fileMessage = await fileRepository.getFileMessage(id);

    return fileMessage;
  }
}