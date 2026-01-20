import { Button, type ButtonVariant } from "@/components/ui/button"
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

interface ConfirmationModalProps {
  title: string
  description?: string
  label?: string
  variant?: ButtonVariant
  open: boolean
  disabled?: boolean
  onClose: () => void
  onConfirm: () => void
  className?: string
}

export default function ConfirmationModal({
  title,
  description,
  label = "Confirm",
  variant = "default",
  open,
  disabled,
  onClose,
  onConfirm,
  className,
}: ConfirmationModalProps) {
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
          <Button variant={variant} disabled={disabled} onClick={onConfirm}>
            {disabled ? <Loading.Dots className="bg-background" /> : label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
