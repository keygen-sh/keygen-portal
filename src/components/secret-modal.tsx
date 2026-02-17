import { useState, useCallback } from "react"

import { Copy, TriangleAlert } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

interface SecretModalProps {
  value: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  warning?: string
  acknowledgment?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function SecretModal({
  value,
  open,
  onOpenChange,
  title,
  description,
  warning,
  acknowledgment,
  action,
}: SecretModalProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  const canDismiss = !acknowledgment || acknowledged

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next)
      if (!next) {
        setAcknowledged(false)
      }
    },
    [onOpenChange],
  )

  const handleCopy = useCallback(async () => {
    await copyToClipboard(value)
    setAcknowledged(true)
  }, [value])

  const handleAction = useCallback(() => {
    action?.onClick()
    setAcknowledged(true)
  }, [action])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        // Prevent dialog close actions/hide button if we're enforcing acknowledgement or not yet acknowledged
        onInteractOutside={(e) =>
          acknowledgment && !acknowledged && e.preventDefault()
        }
        onEscapeKeyDown={(e) =>
          acknowledgment && !acknowledged && e.preventDefault()
        }
        className={cn(
          "md:max-w-xl",
          acknowledgment && !acknowledged && "[&>button:last-child]:hidden",
        )}
      >
        <DialogHeader className={cn((!title || !description) && "sr-only")}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="flex items-center border-b border-accent p-3">
            <h2 className="text-sm text-content-normal">{title}</h2>
          </div>

          <div className="p-6">
            {warning && (
              <p className="mb-6 flex items-start gap-2 rounded-md bg-brand-amber/20 p-2 text-sm text-pretty text-brand-amber">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span className="whitespace-pre-line">{warning}</span>
              </p>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="absolute top-3 right-3 z-10 h-7 w-7"
              >
                <Copy className="size-3.5" />
              </Button>

              <ScrollArea className="h-64 rounded border border-accent">
                <pre className="p-3 font-mono text-sm leading-snug break-all whitespace-pre-wrap">
                  {value}
                </pre>
              </ScrollArea>
            </div>

            {acknowledgment && (
              <label className="mt-10 flex cursor-pointer items-center justify-center gap-2 text-sm text-content-muted">
                <Checkbox
                  checked={acknowledged}
                  onCheckedChange={(v) => setAcknowledged(!!v)}
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
