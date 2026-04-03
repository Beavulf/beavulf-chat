import type { TChatRowDto } from "@/types/chats-types";
import { API_CONFIG } from "@/config/api-config";
import { isResOk } from "@/lib/utils";

// получение чатов пользователя авторизованного 
export async function getChats(): Promise<TChatRowDto[]> {
  const res = await fetch(API_CONFIG.CHATS.GET);
  await isResOk(res); 
  const { chats } = await res.json()

  return chats;
}

// создание чата
export async function createChat(title?:string):Promise<TChatRowDto> {
  const res = await fetch(API_CONFIG.CHATS.POST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  await isResOk(res);
  const data = (await res.json()) as TChatRowDto;

  return data;
}

// удаление чата
export async function deleteChat(chatId: string):Promise<void> {
  const res = await fetch(API_CONFIG.CHATS.DELETE.replace(':id', chatId), {
    method: 'DELETE',
  });
  await isResOk(res);

  return;
}

// переименование чата
export async function renameChat({chatId, title}: {chatId:string, title: string}):Promise<void> {  
  const res = await fetch(API_CONFIG.CHATS.RENAME.replace(':id', chatId),{
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({newTitle:title})
  });
  await isResOk(res);

  return;
}