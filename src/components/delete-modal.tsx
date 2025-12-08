import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

import * as Loading from "@/components/loading"

interface DeleteModalProps {
  title: string
  description?: string
  open: boolean
  disabled?: boolean
  onClose: () => void
  onDelete: () => void
  className?: string
}

export default function DeleteModal({
  title,
  description,
  open,
  disabled,
  onClose,
  onDelete,
  className,
}: DeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-4">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={disabled}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button variant="destructive" disabled={disabled} onClick={onDelete}>
            {disabled ? <Loading.Dots className="bg-background" /> : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
