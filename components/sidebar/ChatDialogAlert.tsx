import { Trash2 } from "lucide-react";
import { AlertDialogDestructive } from "../AlertDialogDestructive";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import type { UseMutationResult } from "@tanstack/react-query";

export function ChatDialogAlert(
  {deleteMutation}:
  {deleteMutation: UseMutationResult<void, Error, void, unknown>}
) {
  return (
    <AlertDialogDestructive 
      dialogTitle="Удаление чата" 
      dialogDescription={<span>Вы действительно хотите удалить данный чат ?</span>}
      onDelete={()=>deleteMutation.mutate()}
      trigger={
        <DropdownMenuItem 
          disabled={deleteMutation.isPending}
          variant="destructive" 
          className='cursor-pointer' 
        >
          <Trash2/>
          Удалить
        </DropdownMenuItem>
      }
    />
  )
}