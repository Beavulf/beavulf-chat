import { NextResponse, NextRequest } from "next/server";
import { messageService } from "@/service/message-service";
import { handleError, isUuidV4 } from "@/lib/utils";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// получение списка сообщений чата
export async function GET(
    req: NextRequest,
    { params } : { params: Promise<{chatId: string}> }
): Promise<NextResponse> {
  try {
    const { chatId } = await params;
    isUuidV4(chatId);
    const messages = await messageService.getMessagesByChatId(chatId);

    return NextResponse.json(
      { messages },
      { status: 200 }
    );
  }
  catch(e) {
    return handleError(e);
  }
}

// создание сообщения для чата по айди
export async function POST(
    req: NextRequest,
    { params } : { params: Promise<{chatId: string}> }
) {
  try {
    const { chatId } = await params;
    isUuidV4(chatId);
    
    // Получаем сообщения от клиента
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    // Последнее сообщение — это новое сообщение пользователя
    const lastUserMessage = messages[messages.length - 1];
    
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return NextResponse.json(
        { error: "Ожидается сообщение пользователя" },
        { status: 400 }
      );
    }

    // Извлекаем текст из последнего сообщения пользователя
    const userText = lastUserMessage.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('');

    if (userText.length > 1000) {
      return NextResponse.json(
        { error: "Текст сообщения не должен превышать 1000 символов" },
        { status: 400 }
      );
    }

    // Сохраняем сообщение пользователя в БД
    await messageService.createMessage(userText, 'user', chatId);

    // Конвертируем UI сообщения в формат модели
    const modelMessages = await convertToModelMessages(messages);

    // Стримим ответ от AI
    const result = streamText({
      model: openrouter('qwen/qwen3.6-plus:free'),
      messages: modelMessages,
      onFinish: async ({ text }) => {
        // Сохраняем ответ ассистента в БД
        if (text) {
          await messageService.createMessage(text, 'assistant', chatId);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  }
  catch(e) {
      return handleError(e);
  }
}