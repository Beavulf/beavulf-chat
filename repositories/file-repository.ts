import { QUERY_KEYS } from "@/constants/constants";
import { DatabaseError } from "@/lib/errors";
import { supabaseServer } from "@/lib/supabase-server"
import type { TMessageFile, TMessageFileInsert } from "@/types/db-types";

const BUCKET = 'chat-documents';

export const fileRepository = {

  // проверка на наличие файла в хранилище
  async fileExistsInStorage(path: string): Promise<boolean> {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET)
      .exists(path);

    if (error) {
      throw new DatabaseError(`Ошибка при получении файла из хранилища: ${error.message}`);
    }
    
    return data
  },

  // загрузка файл на хранилище Supabase
  async uploadFile(
    { path, type, buffer }:
    { path: string, type: string, buffer: Buffer }
  ) {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET)
      .upload(path, buffer,{
        contentType: type || 'application/octet-stream',
        upsert: false,
      });

    if (error) {
      throw new DatabaseError(`Ошибка при загрузке файла: ${error.message}`);
    }

    return data;
  },
  
  // добавление привязки файла в таблицу Файлов
  async insertMessageFileData(fileData: TMessageFileInsert): Promise<TMessageFileInsert | null> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.MESSAGE_FILES)
      .insert(fileData)
      .select()
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) {
      throw new DatabaseError(`Ошибка при добавлении файла в таблицу: ${error.message}`);
    }

    return data;
  },

  // создание временной ссылки на файл
  async createSignedUrl(path: string): Promise<string | null> {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60);

    if (error) {
      throw new DatabaseError(`Ошибка при создании URL: ${error.message}`);
    };

    return data.signedUrl;
  },

  // получение данных о файле по айди
  async getMessageFileData(id: string): Promise<TMessageFile | null> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.MESSAGE_FILES)
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) {
      throw new DatabaseError(`Ошибка при получении файла: ${error.message}`);
    }

    return data;
  },

  // удаление данных о файле сообщения
  async deleteMessageFileData(id: string): Promise<void> {
    const { error } = await supabaseServer
      .from(QUERY_KEYS.MESSAGE_FILES)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new DatabaseError(`Ошибка при удалении данных о файле сообщения: ${error.message}`);
    }

    return;
  },

  // удаление файла из хранилища supabase
  async deleteFileInStorage(path: string): Promise<void> {
    const { error } = await supabaseServer.storage
      .from(BUCKET)
      .remove([path])
    
    if (error) {
      throw new DatabaseError(`Ошибка при удалении файла из хранилища: ${error.message}`);
    }

    return;
  },
}