import type { ModelMessage } from "ai";

export async function enrichMessagesWithFileContent(messages: ModelMessage[]) {
  const last = messages[messages.length - 1];
  if (!last || (last as { role?: unknown })?.role !== 'user') return messages;

  type TextPart = { type: 'text'; text: string };
  type FilePart = { type: 'file'; url: string; name?: string; mimeType?: string };
  type ImagePart = { type: 'image'; image: string | URL; mediaType?: string };
  type UnknownPart = Record<string, unknown> & { type?: unknown };

  const lastContent = (last as { content?: unknown })?.content;
  const contentParts: UnknownPart[] = Array.isArray(lastContent) ? (lastContent as UnknownPart[]) : [];

  const textPart = contentParts.find((p): p is TextPart => p?.type === 'text' && typeof (p as TextPart).text === 'string');
  const fileParts = contentParts.filter((p): p is FilePart => p?.type === 'file' && typeof (p as FilePart).url === 'string');
  const imageParts = contentParts.filter((p): p is ImagePart => {
    if (p?.type !== 'image') return false;
    const img = (p as Partial<ImagePart>).image;
    return typeof img === 'string' || img instanceof URL;
  });

  // Нечего обогащать
  if (fileParts.length === 0 && imageParts.length === 0) return messages;

  const nextMessages: ModelMessage[] = [
    ...messages.slice(0, -1),
    {
      role: 'user',
      // Оставляем текст + изображения (мультимодал), а file-парты убираем (их раскрываем в текст ниже)
      content: [
        ...(textPart ? [textPart] : []),
        ...imageParts,
      ],
    },
  ];

  for (const fp of fileParts) {
    // Поддерживаем только текстовые вложения для "прочитать и вставить"
    const url = fp.url;
    const name = fp.name ?? 'file';
    const mime = fp.mimeType;

    if (!url || typeof url !== 'string') continue;

    if (typeof mime === 'string' && mime !== 'text/plain') {
      nextMessages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Пользователь прикрепил файл "${name}" (${mime}). Я пока умею читать только text/plain, поэтому учитывай файл как внешний контекст по ссылке: ${url}`,
          },
        ],
      });
      continue;
    }

    const res = await fetch(url);
    const fileText = await res.text();

    nextMessages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Вот содержимое прикреплённого файла (${name}):\n\n${fileText}`,
        },
      ],
    });
  }

  return nextMessages;
  }