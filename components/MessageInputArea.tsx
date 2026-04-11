'use client'

import { cn } from "@/lib/utils";
import { Paperclip, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CustomToolTip } from "./CustomToolTip";
import { toast } from "sonner";
import Image from "next/image";
import { useObjectUrl } from "@/hooks/use-object-url";

const MAX_TEXTAREA_HEIGHT = 200

type ChatPayload = {
  id: string;
  message: {
    role: 'user';
    content: string;
    file?: {
      name: string;
      url: string;
      type: string;
    };
  };
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MessageInputArea(
  {
    handleSubmit,
    isPendingOrStreaming,
    suggestionMsg
  }: 
  {
    handleSubmit: ({input, e, file}:{input: string, e?: React.FormEvent, file?: ChatPayload['message']['file']}) => void,
    isPendingOrStreaming: boolean,
    suggestionMsg?: string
  }
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const previewUrl = useObjectUrl(file);

  // выбор файла
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    // проверка размера файла (10 МБ)
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Файл слишком большой (максимум 10 МБ)");
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(selectedFile);
    e.target.value = "";
  };

  // отправка сообщения через родителя с передачей файла
  const onSubmit = async (e?: React.FormEvent) => {
    try {
      e?.preventDefault();
      if (!input.trim() && !file) return;

      let fileMeta: ChatPayload['message']['file'] | undefined;

      if (file) {
        const dataUrl = await fileToDataUrl(file);
        fileMeta = {
          name: file.name,
          url: dataUrl,
          type: file.type,
        };
      }

      handleSubmit({ input, file: fileMeta });
      setInput('');
      setFile(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Ошибка при отправке сообщения: ${error.message}`);
      } else {
        toast.error('Ошибка при отправке сообщения: Неизвестная ошибка');
      }
    }
  };

  // применение шаблона сообщения
  useEffect(() => {
    if (!suggestionMsg) return;
    const t = setTimeout(() => setInput(suggestionMsg), 0);
    return () => clearTimeout(t);
  },[suggestionMsg]);

  // авторазмер поля ввода
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT) + 'px'
  }, [input]);

  // отправка по Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className={cn(
        'relative flex flex-col rounded-2xl bg-[#2f2f2f] border transition-colors shadow-lg',
        isPendingOrStreaming ? 'border-[#3f3f3f]' : 'border-[#3f3f3f] focus-within:border-[#555]'
      )}>
        {/* блок отображения выбранного файла */}
        {file && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="flex items-center bg-[#232323] px-2 py-1 rounded text-xs text-[#dddddd] max-w-[75%] overflow-hidden">
              {/* Если файл изображение, показываем миниатюру */}
              {file.type.startsWith("image/") && previewUrl && (
                <Image
                  src={previewUrl}
                  width={32}
                  height={32}
                  alt={file.name}
                  className="w-8 h-8 object-cover rounded mr-2 border border-[#393939]"
                />
              )}
              <span className="truncate mr-2">{file.name}</span>
              <button
                type="button"
                className="ml-1 px-1 rounded hover:bg-[#393939] text-[#8e8ea0] transition-colors cursor-pointer"
                onClick={() => setFile(null)}
                aria-label="Удалить файл"
              >✕</button>
            </div>
          </div>
        )}
  
        {/* блок ввода и отправки сообщения */}
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
           `max-h-[${MAX_TEXTAREA_HEIGHT}px] overflow-y-auto scrollbar-thin disabled:opacity-50`)}
        />
        <div className="flex items-center justify-between px-3 pb-3">

          <div className="flex items-center gap-1">
            <CustomToolTip content="Прикрепить файл">
              <label
                htmlFor="file-upload"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a5a5a] hover:text-[#acacac] hover:bg-[#3f3f3f] transition-colors cursor-pointer mr-1"
              >
                <input
                  accept="image/png,image/jpeg,image/webp,text/plain"
                  id="file-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                  disabled={isPendingOrStreaming}
                />
                <Paperclip size={16} />
              </label>
            </CustomToolTip>
          </div>
            
          <CustomToolTip content={isPendingOrStreaming ? 'Остановить' : 'Отправить'}>
            <button
              type={isPendingOrStreaming ? "button" : "submit"}
              disabled={!input.trim() && !isPendingOrStreaming}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer',
                (input.trim() && !isPendingOrStreaming) || (!input.trim() && isPendingOrStreaming)
                  ? 'bg-white text-[#171717] hover:bg-white/90 shadow-sm'
                  : 'bg-[#3f3f3f] text-[#5a5a5a] cursor-not-allowed', 
              )}
              onClick={
                isPendingOrStreaming
                  ? () => handleSubmit({ input: '' })
                  : undefined
              }
            >
              {isPendingOrStreaming ? (
                <Square size={14} />
              ) : (
                <Send size={14} />
              )}
            </button>
          </CustomToolTip>

        </div>
      </div>
    </form>
  )
}