import { useState, useRef, useEffect } from "react";
import type { TChatRowDto } from "@/types/chats-types";
import { cn } from "@/lib/utils";
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import Link from 'next/link';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChat, renameChat } from "@/fetchers/chats-api";
import { QUERY_KEYS } from "@/constants/constants";
import { Input } from "../ui/input";
import { AlertDialogDestructive } from "../AlertDialogDestructive";

export default function ChatRow(
    props: {
      chat: TChatRowDto;
      isActive: boolean;
      collapsed: boolean;
    }
) {
  const [isRename, setIsRename] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.chat.title || "Новый чат");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHATS] })
    },
  });

  const renameMutation = useMutation({
    mutationFn: renameChat,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [QUERY_KEYS.CHATS]})
    }
  });

  const submitRename = () => {
    if (!title.trim()) {
      setTitle(props.chat.title || 'Новый чат')
      setIsRename(false);
      return;
    }
    
    renameMutation.mutate({chatId: props.chat.id, title:title});
    setIsRename(false);
  };

  const cancelRename = () => {
    setTitle(props.chat.title || 'Новый чат')
    setIsRename(false);
  }

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
          props.isActive
            ? 'bg-[#2f2f2f] text-white'
            : 'text-[#acacac] hover:bg-[#212121] hover:text-white',
          props.collapsed && 'justify-center px-0'
        )
      }>
        {isRename ? 
          <Input 
            value={title}
            onChange={(e)=>setTitle(e?.target?.value)}
            ref={inputRef}
            className="border-0 m-0" 
            onFocus={(e)=>e.target.select()}
            onBlur={submitRename}
            onKeyDown={e => { 
              if (e.key === "Escape") cancelRename(); 
              if (e.key === "Enter") submitRename();
            }}
          /> : 
          <Link
            href={""}
            data-testid={`link-chat-${props.chat.id}`}
            title={props.chat.title || "sss"}
            className={cn(
              'flex flex-1 gap-2.5 items-center', props.collapsed && 'justify-center px-0'
            )}
          >
            <MessageSquare size={16} className="shrink-0" />
            {!props.collapsed && (<span className="truncate text-[13.5px]">{props.chat.title}</span>)}
          </Link>
        }
        {!props.collapsed &&
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal size={14} className='cursor-pointer'/> 
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-1xl">
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={()=> setIsRename(!isRename)}
              >
                <Pencil/>
                Переименовать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogDestructive 
                dialogTitle="Удаление чата" 
                dialogDescription={<span>Вы действительно хотите удалить данный чат ?</span>}
                onDelete={()=>deleteMutation.mutate(props.chat.id)}
                trigger={
                  <DropdownMenuItem 
                    variant="destructive" 
                    className='cursor-pointer' 
                  >
                    <Trash2/>
                    Удалить
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        }
    </div>
  )
};