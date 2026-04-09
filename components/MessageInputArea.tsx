'use client'

import { cn } from "@/lib/utils";
import { Paperclip, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function MessageInputArea(
  {
    handleSubmit,
    isPendingOrStreaming,
    suggestionMsg
  }: 
  {
    handleSubmit: (text:string, e?: React.FormEvent) => void,
    isPendingOrStreaming: boolean,
    suggestionMsg?: string
  }
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  useEffect(() => {
    if (suggestionMsg) setInput(suggestionMsg);
  },[suggestionMsg]);

  // авторазмер поля ввода
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input]);

  // отправка по Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input, e);
      setInput('');
    }
  };

  // const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!input.trim() && !file) return;

  //   let fileMeta: ChatPayload['message']['file'] | undefined;

  //   if (file) {
  //     const form = new FormData();
  //     form.append('file', file);
  //     const res = await fetch('/api/upload', { method: 'POST', body: form });
  //     const data = await res.json();
  //     fileMeta = {
  //       name: file.name,
  //       url: data.url,      // публичный или подписанный URL
  //       type: file.type,
  //     };
  //   }
  //   handleSubmit(input, e);
  //   setInput('');
  // };


  return (
    <form onSubmit={(e)=>{handleSubmit(input, e); setInput('');}} className="w-full">
      <div className={cn(
        'relative flex flex-col rounded-2xl bg-[#2f2f2f] border transition-colors shadow-lg',
        isPendingOrStreaming ? 'border-[#3f3f3f]' : 'border-[#3f3f3f] focus-within:border-[#555]'
      )}>
        <textarea
          ref={textareaRef}
          data-testid="input-message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="О чем вы думаете..."
          rows={1}
          disabled={isPendingOrStreaming}
          className={cn("resize-none bg-transparent px-4 pt-4 pb-3 text-sm",
           "text-white placeholder:text-[#5a5a5a] focus:outline-none leading-relaxed",
           "max-h-[200px] overflow-y-auto scrollbar-thin disabled:opacity-50")}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <input type="file" onChange={onFileChange}></input>
            <button
              type="button"
              data-testid="button-attach"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#3f3f3f] transition-colors"
              title="Прикрепить файл"
              disabled={isPendingOrStreaming}
            >
              <Paperclip size={16} />
            </button>
          </div>

          <button
            type="submit"
            data-testid="button-send"
            disabled={!input.trim() && !isPendingOrStreaming}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer',
              (input.trim() && !isPendingOrStreaming) || (!input.trim() && isPendingOrStreaming)
                ? 'bg-white text-[#171717] hover:bg-white/90 shadow-sm'
                : 'bg-[#3f3f3f] text-[#5a5a5a] cursor-not-allowed', 
            )}
            title={isPendingOrStreaming ? 'Остановить' : 'Отправить'}
          >
            {isPendingOrStreaming ? (
              <Square size={14} onClick={()=>handleSubmit('')}/>
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}