import { API_CONFIG } from "@/config/api-config";
import { isResOk } from "@/lib/utils";
import type { TMessage } from "@/types/db-types";

export async function getMessages(chatId: string): Promise<TMessage[]> {
  const res = await fetch(API_CONFIG.MESSAGES.GET.replace(':chatId', chatId));
  await isResOk(res);
  const { messages } : { messages: TMessage[] } = await res.json();

  return messages;
}

export async function createMessage(
  {
    chatId,
    content,
    role
  }:
  {chatId: string, content: string, role: string}
): Promise<void> {
  const res = await fetch(API_CONFIG.MESSAGES.POST.replace(':chatId', chatId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, role }),
  })
  await isResOk(res);
  const { message } : { message: TMessage } = await res.json();

  return;
}