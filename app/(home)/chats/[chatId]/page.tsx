'use client'

import { useRef, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Bot, CircleDashed 
} from 'lucide-react'
import { dbMessageToUIMessage } from '@/lib/utils'
import { useRealtimeMessages } from '@/hooks/realtime-messages'
import { useQuery } from '@tanstack/react-query'
import { getMessages } from '@/fetchers/message-api'
import { AI_MODELS, QUERY_KEYS, type AiModels } from '@/constants/constants'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { API_CONFIG } from '@/config/api-config'
import { MessageBubble } from '@/components/chat-message/MessageBubble'
import { toast } from 'sonner'
import { MessageInputArea } from '@/components/MessageInputArea'
import { useRouter } from 'next/navigation'
import { createMessageParts, getInitialMessageDataFromLocalStorage } from '../_helper'

type TFile = {
  name: string;
  url: string;
  type: string;
}

export default function ChatPage(
  { params }:
  { params: Promise<{ chatId: string }> }
) {
  const { chatId } = use(params)
  const searchParams = useSearchParams()
  const initialMessagesLoaded = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initializedFirstMessage = useRef(false) 
  const firstMessage = searchParams.get('firstMessage')
  const router = useRouter();
  
  // useChat с нашим роутом и отправкой одного сообщения в запросе
  const {status, sendMessage, messages, setMessages, regenerate, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: API_CONFIG.MESSAGES.POST.replace(':chatId', chatId),
      prepareSendMessagesRequest: ({id, messages}) => {
        return {
          body: {
            id,
            message: messages[messages.length - 1]
          }
        }
      }
    }),
  });

  // подписка на сообщения
  useRealtimeMessages({chatId, setChatMessages: setMessages});
  const isStreaming = status === 'submitted' || status === 'streaming';
  const showAssistantPlaceholder = isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === 'user';
   
  // Получение истории сообщений из БД
   const { data: historyMessages = [], isLoading, isPending } = useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, chatId],
    queryFn: () => getMessages(chatId),
    enabled: !!chatId
  })

  // Если переход с главной и первым сообщением
  useEffect(() => {
    if (firstMessage && !initializedFirstMessage.current && !initialMessagesLoaded.current) {
      initializedFirstMessage.current = true
      // проверяем, есть ли уже сообщения в БД — если да, НЕ отправляем повторно
      if (historyMessages.length > 0) {
        initialMessagesLoaded.current = true;
        router.replace(window.location.pathname, { scroll: false });
        return;
      }

      // формируем данные для отправки
      const {model, attachedFile} = getInitialMessageDataFromLocalStorage();
      const {parts, metadata} = createMessageParts(
        {model, messageText: firstMessage, file: attachedFile}
      );
    
      sendMessage({ parts, metadata });
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [firstMessage, sendMessage, initialMessagesLoaded, historyMessages, router]);

  // инициализируем истории из БД в хук useChat
  useEffect(() => {   
    if (historyMessages.length > 0 && !initialMessagesLoaded.current && !initializedFirstMessage.current) {
      setMessages(historyMessages
        .slice()
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(dbMessageToUIMessage)
      )      
      initialMessagesLoaded.current = true;
    }
  }, [historyMessages, initialMessagesLoaded, setMessages]);

  // отображение ошибки из useChat
  useEffect(()=>{    
    if (error) toast.error(error?.message);
  },[error]);

  // отправка сообщения
  const handleSubmit = async (
    {
      input, file, model=AI_MODELS.GROK
    }:
    {
      input: string, 
      model: AiModels,
      file? : TFile
    }
  ) => {
    if (isStreaming) await stop();

    const trimmed = input.trim();
    if (!trimmed && !file) return;

    const {parts, metadata} = createMessageParts(
      {model, messageText: trimmed, file: file}
    );
    
    await sendMessage({ metadata, parts });
    router.replace(window.location.pathname, { scroll: false })
  }

  // прокрутить в конец при открытии страницы
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, lastMessageId]);

  return (
    <div className="relative flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-10 h-10 rounded-full bg-[#2f2f2f] flex items-center justify-center mb-3">
                <Bot size={20} className="text-[#8e8ea0]" />
              </div>
              <p className="text-sm text-[#5a5a5a]">Начните разговор</p>
            </div>
          )}
          {isPending && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <CircleDashed className='animate-spin text-[#8e8ea0]'/>
              <p className="text-sm text-[#5a5a5a]">Загрузка сообщений...</p>
            </div>
          )}
     
          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                status={status}
                isLast={isLastMessage}
                regenerate={regenerate}
              />
            )
          })}

          {showAssistantPlaceholder && (
            <MessageBubble
              key="assistant-placeholder"
              message={{
                id: "assistant-placeholder",
                role: "assistant",
                parts: [{ type: "text", text: "" }],
              }}
              status={status}
              isLast
              regenerate={regenerate}
            />
          )}
          <div ref={bottomRef} />
        </div>

      </div>

      <div className="shrink-0 px-4 pb-5 pt-2">
        <div className="mx-auto max-w-3xl">
          <MessageInputArea handleSubmit={handleSubmit} isPendingOrStreaming={isStreaming}/>
          <p className="mt-2 text-center text-[11px] text-[#3f3f3f]">
            Beavulf может допускать ошибки. Проверяйте важную информацию.
          </p>
        </div>
      </div>

    </div>
  )
}