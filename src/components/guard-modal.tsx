import { useState, useCallback } from "react"

import { TriangleAlert } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

interface GuardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  warning?: string
  acknowledgment?: string
  isAcknowledged?: boolean
  action?: {
    label: string
    onClick: () => void | Promise<void>
  }
  children?: React.ReactNode
}

export default function GuardModal({
  open,
  onOpenChange,
  title,
  description,
  warning,
  acknowledgment,
  isAcknowledged,
  action,
  children,
}: GuardModalProps) {
  const [isInternallyAcknowledged, setIsInternallyAcknowledged] =
    useState(false)
  const [actionPending, setActionPending] = useState(false)

  const effectiveIsAcknowledged = isAcknowledged || isInternallyAcknowledged
  const canDismiss = !acknowledgment || effectiveIsAcknowledged

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next)
      if (!next) {
        setIsInternallyAcknowledged(false)
        setActionPending(false)
      }
    },
    [onOpenChange],
  )

  const handleAction = useCallback(async () => {
    if (!action) return

    try {
      setActionPending(true)
      await action.onClick()
      setIsInternallyAcknowledged(true)
    } finally {
      setActionPending(false)
    }
  }, [action])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) =>
          acknowledgment && !effectiveIsAcknowledged && e.preventDefault()
        }
        onEscapeKeyDown={(e) =>
          acknowledgment && !effectiveIsAcknowledged && e.preventDefault()
        }
        className={cn(
          "md:max-w-xl",
          acknowledgment &&
            !effectiveIsAcknowledged &&
            "[&>button:last-child]:hidden",
        )}
      >
        <DialogHeader
          className={cn(!title && !description ? "sr-only" : "p-4")}
        >
          <DialogTitle className="text-sm font-normal text-content-normal">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="border-t border-accent p-6">
            {warning && (
              <p className="mb-6 flex items-start gap-2 rounded-md bg-brand-amber/20 p-2 text-sm text-pretty text-brand-amber">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span className="whitespace-pre-line">{warning}</span>
              </p>
            )}

            {children}

            {acknowledgment && (
              <label className="mt-10 flex items-center justify-center gap-2 text-sm text-content-muted">
                <Checkbox
                  checked={effectiveIsAcknowledged}
                  onCheckedChange={(v) => setIsInternallyAcknowledged(!!v)}
                  disabled={actionPending || !!isAcknowledged}
                  className="mt-0.5"
                />
                <span>{acknowledgment}</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-accent p-3 md:justify-end">
            {!canDismiss ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    className="max-w-48 flex-1 basis-1/2 rounded-md transition-colors hover:bg-background-1"
                  >
                    <Button
                      variant="outline"
                      type="button"
                      disabled
                      className="w-full"
                    >
                      Dismiss
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 bg-background-4 text-pretty text-content-muted">
                  Acknowledge the above before dismissing.
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOpenChange(false)}
                className="max-w-48 flex-1 basis-1/2"
              >
                Dismiss
              </Button>
            )}
            {action && (
              <Button
                type="button"
                onClick={handleAction}
                disabled={actionPending}
                className="max-w-48 flex-1 basis-1/2"
              >
                {action.label}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
