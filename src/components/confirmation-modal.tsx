import { useEffect, useState } from "react"

import { Copy } from "lucide-react"

import { Input } from "@/components/ui/input"
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { copyToClipboard } from "@/lib/clipboard"

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
  confirmText?: string
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
  confirmText,
  className,
}: ConfirmationModalProps) {
  const [typedConfirmation, setTypedConfirmation] = useState("")

  useEffect(() => {
    if (!open) setTypedConfirmation("")
  }, [open])

  const isConfirmTextMatched = !confirmText || typedConfirmation === confirmText

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {confirmText && (
          <div className="flex flex-col gap-2 text-sm text-content-muted">
            <div className="mb-2 inline-flex flex-wrap items-center gap-1.5">
              Please type
              <Button
                variant="clipboard"
                size="clipboard"
                type="button"
                onClick={() => copyToClipboard(confirmText)}
                className="w-fit"
              >
                {confirmText}
                <Copy className="size-3" />
              </Button>
              to confirm.
            </div>
            <Input
              autoFocus
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              disabled={disabled}
            />
          </div>
        )}
        <AlertDialogFooter className="gap-4">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={disabled}>
              Cancel
            </Button>
          </AlertDialogCancel>
          {!isConfirmTextMatched ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="rounded-md transition-colors hover:bg-background-1"
                >
                  <Button variant={variant} disabled className="w-full">
                    {label}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
                Enter the above to proceed.
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button variant={variant} disabled={disabled} onClick={onConfirm}>
              {disabled ? <Loading.Dots className="bg-background" /> : label}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
