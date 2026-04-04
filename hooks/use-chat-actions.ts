import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChat, renameChat } from "@/fetchers/chats-api";
import { QUERY_KEYS } from "@/constants/constants";
import { ROUTE_CONFIG } from "@/config/route-config";
import { toast } from "sonner"; 

export function useChatActions(chatId: string) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isActive = pathname === ROUTE_CONFIG.CHAT_BY_ID.replace(':id', chatId);

  const deleteMutation = useMutation({
    mutationFn: () => deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHATS],
      });
      if (isActive) router.push('/');
      toast.success("Чат успешно удален");
    },
    onError: (e) => {
      toast.error(`Не удалось удалить чат: ${e.message}`);
    },
  });

  const renameMutation = useMutation({
    mutationFn: (title: string) => renameChat({chatId, title}),
    onSuccess: () => {
      toast.success("Чат успешно переименован");
    },
    onError: (e) => {
      toast.error(`Не удалось переименовать чат: ${e.message}`);
    },
  });

  return { deleteMutation, renameMutation, isActive };
}