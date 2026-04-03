import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AlertDialogDestructive(
  props: {
    dialogTitle: string,
    dialogDescription: React.ReactNode,
    trigger: React.ReactNode,
    onDelete: ()=>void
  }
) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild onSelect={(e) => e.preventDefault()}>
        {props.trigger}
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{props.dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.dialogDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" className="cursor-pointer">Отмена</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="cursor-pointer" onClick={props.onDelete}>Удалить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
