import { NextResponse, NextRequest } from "next/server";
import { messageService } from "@/service/message-service";
import { dbMessageToUIMessage, extractTextFromMessage, handleError, isUuidV4 } from "@/lib/utils";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { enrichMessagesWithFileContent } from "./[messageId]/_helper";

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

// отправка сообщения ИИ, получения ответа, запись в БД
export async function POST(
    req: NextRequest,
    { params } : { params: Promise<{chatId: string}> }
) {
  try {
    const { chatId } = await params;
    isUuidV4(chatId);

    const { message } : { id: string, message: UIMessage } = await req.json();

    if (!message || typeof message !== 'object') {
      return NextResponse.json(
        { error: "Некорректное сообщение" },
        { status: 400 }
      );
    }

    // извлекаем текст из последнего сообщения пользователя
    const userText = extractTextFromMessage(message);

    if (!userText || userText.trim().length === 0) {
      return NextResponse.json(
        { error: "Текст сообщения не может быть пустым" },
        { status: 400 }
      );
    }

    if (userText.trim().length < 1) {
      return NextResponse.json(
        { error: "Текст сообщения слишком короткий" },
        { status: 400 }
      );
    }

    if (userText.length > 1000) {
      return NextResponse.json(
        { error: "Текст сообщения не должен превышать 1000 символов" },
        { status: 400 }
      );
    }

    // сохраняем сообщение пользователя в БД
    await messageService.createMessage(userText, 'user', chatId);
    // поулчаем историю из БД
    const dbMessages = await messageService.getMessagesByChatId(chatId);
    const uiMessagesFromDb = dbMessages.map(dbMessageToUIMessage);
    // конвертируем UI сообщения в формат модели
    const modelMessages = await convertToModelMessages(uiMessagesFromDb);

    const messagesWithFile = enrichMessagesWithFileContent(modelMessages);
    
    // делаем запрос к ИИ
    const result = streamText({
      model: openrouter('qwen/qwen3.6-plus'),
      messages: messagesWithFile,
      abortSignal: req.signal,
      onError: (error) => {
        return error.message;
      }
    });

    // стрим ответа ИИ
    return result.toUIMessageStreamResponse({
      originalMessages: uiMessagesFromDb,
      onFinish: async ({ responseMessage, finishReason }) => {
        if (finishReason === 'error') {
          return;
        }
        if (responseMessage) {
          if (responseMessage.parts.length < 1) {
            return;
          }
          await messageService.createMessage(extractTextFromMessage(responseMessage), 'assistant', chatId);
        }
      },
      onError: (error) => {
        return `Ошибка при получении ответа от OpenRouter: ${(error?.message || 'Неизвестная ошибка')}`;
      }
    });
  }
  catch(e) {
    return handleError(e);
  }
}