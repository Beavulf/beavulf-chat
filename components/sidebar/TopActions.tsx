import { SquarePen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChat } from "@/fetchers/chats-api";
import { QUERY_KEYS } from "@/constants/constants";
import { toast } from "sonner";

export default function TopActions(
  { collapsed }: 
  { collapsed: boolean }
) {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHATS] });
      toast.success('Новый чат создан');
      // if (newChat?.id) {
      //   router.push(`/chats/${newChat.id}`)
      // }
    },
    onError: (e) => {
      toast.error(`Не удалось создать чат: ${e.message}`);
    }
  });

  return (
    <div className={cn('flex items-center gap-1 p-3 pt-4', collapsed ? 'justify-center' : 'justify-between')}>
      {!collapsed && (
        <Link href="/" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#2f2f2f] transition-colors">
          <svg
            aria-label="Beavulf Chat"
            viewBox="0 0 28 28"
            fill="none"
            className="w-6 h-6 shrink-0"
          >
            <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" className="text-white/80" />
            <path
              d="M8 19V9h5.5a3.5 3.5 0 0 1 0 7H8M13.5 16H20"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            />
          </svg>
          <span className="text-white font-semibold text-sm tracking-tight">Beavulf</span>
        </Link>
      )}

      {collapsed && (
        <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#2f2f2f] transition-colors">
          <svg aria-label="Beavulf Chat" viewBox="0 0 28 28" fill="none" className="w-5 h-5">
            <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" className="text-white/80" />
            <path d="M8 19V9h5.5a3.5 3.5 0 0 1 0 7H8M13.5 16H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
          </svg>
        </Link>
      )}

      <button
        data-testid="button-new-chat"
        onClick={()=>createMutation.mutate('')}
        disabled={createMutation.isPending}
        className={cn(
          'flex items-center justify-center rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#2f2f2f] transition-colors cursor-pointer',
          collapsed ? 'w-9 h-9' : 'w-9 h-9'
        )}
        title="Новый чат"
      >
        <SquarePen size={18} />
      </button>
    </div>
  )
}