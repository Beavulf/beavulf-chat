import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, MoreHorizontal, Pencil } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator 
} from "../ui/dropdown-menu";
import Link from 'next/link';
import { Input } from "../ui/input";
import { ROUTE_CONFIG } from "@/config/route-config";
import { useChatActions } from "@/hooks/use-chat-actions";
import type { TChat } from "@/types/db-types";
import { ChatDialogAlert } from "./ChatDialogAlert";

const TITLE_STR = "Новый чат";

export default function ChatRow(
  {
    chat,
    collapsed,
    onNavigate,
  }:
  {
    chat: TChat;
    collapsed: boolean;
    onNavigate?: () => void;
  }
) {
  const [isRename, setIsRename] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(chat.title || TITLE_STR);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isActive, deleteMutation, renameMutation } = useChatActions(chat.id);

  const finalTitle = chat.title || TITLE_STR;

  const submitRename = () => {
    const trimmed = title.trim();
    if (!trimmed || renameMutation.isPending) {
      cancelRename();
      return;
    }
    
    renameMutation.mutate(trimmed);
    setIsRename(false);
  };

  const cancelRename = () => {
    setTitle(finalTitle)
    setIsRename(false);
  }

  // установка фокуса на импут после рендера dropdown меню
  useEffect(() => {
    if (isRename) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isRename]);

  return (
    <div className={
        cn(
          'group flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors justify-between',
          !!isActive
            ? 'bg-[#2f2f2f] text-white'
            : 'text-[#acacac] hover:bg-[#212121] hover:text-white',
          collapsed && 'justify-center px-0'
        )
      }>
        {isRename ? 
          <Input 
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            ref={inputRef}
            className="border-0 m-0" 
            onFocus={(e)=>e.target.select()}
            onBlur={submitRename}
            onKeyDown={e => { 
              if (e.key === "Escape") cancelRename(); 
              if (e.key === "Enter") {
                e.preventDefault(); 
                submitRename();
              }
            }}
          /> : 
          <Link
            href={ROUTE_CONFIG.CHAT_BY_ID.replace(':id', chat.id)}
            title={finalTitle}
            onClick={onNavigate}
            className={cn(
              'flex flex-1 gap-2.5 items-center max-w-50', collapsed && 'justify-center px-0'
            )}
          >
            {collapsed && <MessageSquare size={16} className="shrink-0" />}
            {!collapsed && (<span className="truncate text-[13.5px]">{chat.title}</span>)}
          </Link>
        }
        {!collapsed &&
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal size={14} className='cursor-pointer text-gray-400 hover:text-white'/> 
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-1xl">
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={()=> setIsRename(!isRename)}
                disabled={renameMutation.isPending || deleteMutation.isPending}
              >
                <Pencil/>
                Переименовать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ChatDialogAlert deleteMutation={deleteMutation}/>
            </DropdownMenuContent>
          </DropdownMenu>
        }
    </div>
  )
};