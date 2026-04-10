import type { ModelMessage } from "ai";

export async function enrichMessagesWithFileContent(messages: ModelMessage[]) {
    const last = messages[messages.length - 1];
  
    const filePart = last.content?.find(
      (p: any) => p.type === 'file'
    );
  
    if (!filePart) return messages;
  
    // Скачиваем файл по URL, читаем как текст
    const res = await fetch(filePart.url);
    const fileText = await res.text();
  
    return [
      ...messages.slice(0, -1),
      {
        ...last,
        content: [
          { type: 'text', text: last.content?.find((p: any) => p.type === 'text')?.text ?? '' },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Вот содержимое прикреплённого файла (${filePart.name}):\n\n${fileText}`,
          },
        ],
      },
    ];
  }