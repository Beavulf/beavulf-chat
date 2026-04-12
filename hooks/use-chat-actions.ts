import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChat, renameChat } from "@/fetchers/chats-api";
import { QUERY_KEYS } from "@/constants/constants";
import { ROUTE_CONFIG } from "@/config/route-config";
import { toast } from "sonner";
import { useSession } from "./use-session";

export function useChatActions(chatId: string) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const userId = user?.id;
  const isActive = pathname === ROUTE_CONFIG.CHAT_BY_ID.replace(':id', chatId);
  const queryKey = [QUERY_KEYS.CHATS, userId];

  const deleteMutation = useMutation({
    mutationFn: () => deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      if (isActive) router.push('/');
      toast.success("Чат успешно удален");
    },
  });

  const renameMutation = useMutation({
    mutationFn: (title: string) => renameChat({chatId, title}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Чат успешно переименован");
    },
  });

  return { deleteMutation, renameMutation, isActive };
}