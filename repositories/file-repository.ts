import { QUERY_KEYS } from "@/constants/constants";
import { supabaseServer } from "@/lib/supabase-server"
import type { TMessageFile, TMessageFileInsert } from "@/types/db-types";

export const fileRepository = {
  async uploadFile({
    path, type, buffer
  }:
  {
    path: string, type: string, buffer: Buffer
  }) {
    const { data, error } = await supabaseServer.storage
    .from('chat-documents')
    .upload(path, buffer,{
      contentType: type,
      upsert: false,
    });

    if (error) {
      throw new Error(`Ошибка при загрузке файла: ${error.message}`);
    }

    return data;
  },
  
  async insertToFileTable(fileData: TMessageFileInsert): Promise<TMessageFileInsert | null> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.MESSAGE_FILES)
      .insert(fileData)
      .select()
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) {
      throw new Error(`Ошибка при добавлении файла в таблицу: ${error.message}`);
    }

    return data;
  },

  async createSignedUrl(path: string): Promise<string | null> {
    const { data, error } = await supabaseServer.storage
      .from('chat-documents')
      .createSignedUrl(path, 60 * 60);

    if (error) {
      throw new Error(`Ошибка при создании URL: ${error.message}`);
    };

    return data.signedUrl;
  },

  async getFileMessage(id: string): Promise<TMessageFile | null> {
    const { data, error } = await supabaseServer
      .from(QUERY_KEYS.MESSAGE_FILES)
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) {
      throw new Error(`Ошибка при получении файла: ${error.message}`);
    }

    return data;
  }
}