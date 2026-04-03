import { MessageSquare } from "lucide-react"
import ChatRow from "./ChatRow"
import { Skeleton } from "../ui/skeleton"
import { useQuery } from "@tanstack/react-query";
import { getChats } from "@/fetchers/chats-api";
import { QUERY_KEYS } from "@/constants/constants";

export default function ChatList(
  props: {
    collapsed: boolean,
  }
) {

  const { data: chats=[], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CHATS],
    queryFn: getChats,
  })

  return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-thin">
      {!props.collapsed && (
        <div className="px-2 py-1 mb-1">
          <p className="text-xs font-medium text-[#8e8ea0] uppercase tracking-wider">Чаты</p>
        </div>
      )}

      {isLoading && !props.collapsed && (
        <div className="space-y-1 px-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg bg-[#2f2f2f]" />
          ))}
        </div>
      )}

      {!isLoading && chats.length === 0 && !props.collapsed && (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <MessageSquare size={28} className="text-[#3f3f3f] mb-2" />
          <p className="text-xs text-[#4a4a4a]">Нет чатов</p>
          <p className="text-xs text-[#3f3f3f] mt-0.5">Начните новый разговор</p>
        </div>
      )}

      <nav className="space-y-0.5">
        {chats.map((chat) => {
          // const isActive = pathname === `/chats/${chat.id}`
          return (
            <ChatRow key={chat.id} chat={chat} isActive={false} collapsed={props.collapsed}/>
          )
        })}
      </nav>
    </div>
  )
};