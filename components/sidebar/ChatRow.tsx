import type { TChatRowDto } from "@/types/chats-types";
import { cn } from "@/lib/utils";
import { MessageSquare, MoreHorizontal, Pencil, Trash2   } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import Link from 'next/link';

export default function ChatRow(
    props: {
      chat: TChatRowDto;
      isActive: boolean;
      collapsed: boolean;
      onDelete: (id: string)=> void
    }
) {
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
            <Link
                href={""}
                data-testid={`link-chat-${props.chat.id}`}
                title={props.chat.title || "sss"}
                className={cn(
                  'flex flex-1 gap-2.5 items-center',
                )}
            >
              <MessageSquare size={16} className="shrink-0" />
              {!props.collapsed && (<span className="truncate text-[13.5px]">{props.chat.title}</span>)}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreHorizontal size={14} className='cursor-pointer'/> 
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-1xl">
                <DropdownMenuItem className='cursor-pointer'>
                  <Pencil/>
                  Переименовать
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className='cursor-pointer' onClick={()=>props.onDelete(props.chat.id)}>
                  <Trash2/>
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
};