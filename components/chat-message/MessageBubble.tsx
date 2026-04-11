import { cn, extractTextFromMessage } from "@/lib/utils"
import type { UIMessage } from "ai"
import { useState } from "react"
import { ChatMessageMarkdown } from "./ChatMessageMarkdown"
import { Copy, CopyCheck, RefreshCw, ThumbsDown, ThumbsUp, RefreshCcw } from "lucide-react"
import { CustomToolTip } from "../CustomToolTip"

export function MessageBubble(
  { 
    message, status, isLast, regenerate , fileName
  }: 
  { 
    message: UIMessage, status: string, isLast?: boolean, regenerate: ()=>void, fileName?: string | null
  }
) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const content = extractTextFromMessage(message)
  const iconStyle = 'flex h-7 w-7 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#2f2f2f] transition-colors cursor-pointer'

  // контроль копирования
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div
      data-testid={`message-${message.role}`}
      className={cn('group flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('flex flex-col gap-1 max-w-full', isUser && 'items-end')}>

        {/* индикатор подготовки сообщения ИИ, только для последнего */}
        {!isUser && (status === 'streaming' || status === 'submitted') && isLast && !content && (
          <span className={cn(
            "flex items-center gap-2",
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            "bg-[#222] text-[gray]",
          )}>
            <RefreshCcw className="animate-spin mr-2 w-4 h-4 inline-block text-[gray]" />
            Подготавливаю ответ...
          </span>
        )}
        {!isUser && status === 'error' && isLast && !content && (
          <span className={cn(
            "flex items-center gap-2",
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            "bg-[#222] text-[#ececec]"
          )}>
            <RefreshCcw className="animate-spin mr-2 w-4 h-4 inline-block" />
            Ошибка
          </span>
        )}

        {/* {fileName && isUser && (
          <div className="flex items-center gap-2 mt-1 text-xs text-[#b4b4b4]">
            <span className="inline-block bg-[#232323] rounded px-2 py-1">
              📎 Прикреплен файл: <span className="font-medium">{fileName}</span>
            </span>
          </div>
        )} */}
   
        <ChatMessageMarkdown text={content} isUser={isUser}/>

        {/* кнопки действия на сообщени ИИ */}
        {!isUser && content && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
           
            <CustomToolTip content={copied ? 'Скопировано!' : 'Скопировать'}>
              <div
                onClick={handleCopy}
                className={iconStyle}
              >
                {copied ? <CopyCheck size={13}/> :<Copy size={13} />}
              </div>
            </CustomToolTip>

            <CustomToolTip content={"Полезно"}>
              <div className={iconStyle}>
                <ThumbsUp size={13} />
              </div>
            </CustomToolTip>

            <CustomToolTip content={"Не полезно"}>
              <div className={iconStyle}>
                <ThumbsDown size={13} />
              </div>
            </CustomToolTip>

            <CustomToolTip content={"Сгенерировать заново"}>
              <div className={iconStyle}>
                <RefreshCw size={13} onClick={()=>regenerate()}/>
              </div>
            </CustomToolTip>

          </div>
        )}
      </div>
    </div>
  )
}