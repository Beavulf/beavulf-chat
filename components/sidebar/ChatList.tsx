import { MessageSquare } from "lucide-react";
import ChatRow from "./ChatRow";
import { Skeleton } from "../ui/skeleton";
import type { TChat } from "@/types/db-types";

export default function ChatList(
  {
    collapsed,
    isPending,
    chats,
    isError,
    isFetching
  }:
  {
    collapsed: boolean,
    isPending: boolean,
    isError: boolean,
    isFetching: boolean
    chats: TChat[],
  }
) {

  return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-thin">
      {!collapsed && (
        <div className="px-2 py-1 mb-1">
          <p className="text-xs font-medium text-[#8e8ea0] uppercase tracking-wider">Чаты</p>
        </div>
      )}

      {isFetching && !isPending && (
        <div className="h-0.5 bg-gray-500/50 animate-pulse my-2 mx-2" />
      )}

      {isPending && !collapsed && (
        <div className="space-y-1 px-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg bg-[#2f2f2f]" />
          ))}
        </div>
      )}

      {!isPending && chats.length === 0 && !collapsed && (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <MessageSquare size={28} className="text-[#3f3f3f] mb-2" />
          <p className="text-xs text-[#4a4a4a]">Нет чатов</p>
          <p className="text-xs text-[#3f3f3f] mt-0.5">Начните новый разговор</p>
        </div>
      )}

      {isError && !collapsed && (
        <div className="px-4 py-6 flex flex-col items-center text-center">
          <span className="text-xs text-red-400 mb-2">Не удалось загрузить чаты</span>
          <button
            className="mt-2 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-xs text-white font-medium transition-colors border-none outline-none focus:ring-2 focus:ring-red-600"
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
          >
            Повторить
          </button>
        </div>
      )}
 

      {!isPending && (
        <nav className="space-y-0.5">
          {chats.map((chat) => <ChatRow key={chat.id} chat={chat} collapsed={collapsed}/> )}
        </nav>
      )}
    </div>
  )
};