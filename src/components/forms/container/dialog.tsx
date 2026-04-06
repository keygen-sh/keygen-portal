import { useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog"

import { useMobile } from "@/hooks/use-mobile"

import { FormDialogGuard } from "@/components/forms/guard"
import { useFormGuardContext } from "@/contexts/form-guard-context"

import { cn } from "@/lib/utils"

interface FormsContainerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fullscreen?: boolean
  disableOverlay?: boolean
  children: React.ReactNode
  className?: string
}

export default function FormsContainerDialog({
  open,
  onOpenChange,
  fullscreen = false,
  disableOverlay = false,
  children,
  className,
}: FormsContainerDialogProps) {
  return (
    <FormDialogGuard onClose={() => onOpenChange(false)}>
      <FormsContainerDialogInner
        open={open}
        fullscreen={fullscreen}
        disableOverlay={disableOverlay}
        className={className}
      >
        {children}
      </FormsContainerDialogInner>
    </FormDialogGuard>
  )
}

interface FormsContainerDialogInnerProps {
  open: boolean
  fullscreen?: boolean
  disableOverlay?: boolean
  children: React.ReactNode
  className?: string
}

function FormsContainerDialogInner({
  open,
  fullscreen = false,
  disableOverlay = false,
  children,
  className,
}: FormsContainerDialogInnerProps) {
  const isMobile = useMobile()
  const { abandon } = useFormGuardContext()

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        abandon()
      }
    },
    [abandon],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        disableOverlay={disableOverlay}
        className={cn(
          fullscreen || isMobile
            ? "min-h-screen min-w-screen rounded-none border-none"
            : "md:max-w-fit",
          className,
        )}
      >
        {/* Satisfies Radix's accessibility requirements while visually hiding elements; form layouts handle visual headers */}
        <DialogHeader className="sr-only">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

interface FormsContainerOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FormsContainerOverlay({
  open,
  onOpenChange,
}: FormsContainerOverlayProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
      </DialogPortal>
    </Dialog>
  )
}
