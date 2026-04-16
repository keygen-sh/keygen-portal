import { useCallback } from "react"
import { useFormContext, type FieldValues } from "react-hook-form"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { APIError } from "@/types/api"
import { FormSize } from "@/types/forms"

import { cn } from "@/lib/utils"
import { handleFormError } from "@/lib/form-errors"

import { useSubmitOnce } from "@/hooks/use-submit-once"

import { useFormGuardContext } from "@/contexts/form-guard-context"

import * as Loading from "@/components/loading"

interface FormsContentSheetProps<T extends FieldValues = FieldValues> {
  title?: string
  onSubmit: (data: T) => void | Promise<void>
  onClose?: () => void
  errorMessage?: string
  submitLabel?: string
  cancelLabel?: string
  showCancel?: boolean
  isPending?: boolean
  size?: FormSize
  inline?: boolean
  children: React.ReactNode
  className?: string
}

export default function FormsContentSheet<T extends FieldValues = FieldValues>({
  title,
  onSubmit,
  onClose,
  errorMessage,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel,
  isPending = false,
  size = "default",
  inline = false,
  children,
  className,
}: FormsContentSheetProps<T>) {
  const form = useFormContext()
  const guard = useFormGuardContext()

  const [submitOnce, resetSubmitOnce] = useSubmitOnce(async () => {
    await form.handleSubmit(async (data) => {
      try {
        await onSubmit(data as T)
        guard.close()
        onClose?.()
      } catch (error) {
        if (errorMessage && error instanceof APIError) {
          await handleFormError({
            form,
            toastMessage: errorMessage ?? "",
            apiError: error,
          })
        }

        throw error
      }
    })()
  })

  const handleAbandon = useCallback(() => {
    guard.abandon(onClose)
  }, [guard, onClose])

  const handleSubmit = useCallback(async () => {
    try {
      await submitOnce()
    } catch {
      resetSubmitOnce()
    }
  }, [submitOnce, resetSubmitOnce])

  const showClose = inline && !!onClose
  const resolvedShowCancel = showCancel ?? !showClose

  return (
    <div
      className={cn(
        "flex flex-col",
        inline
          ? "h-auto"
          : {
              default:
                "h-[calc(100vh-2rem)] md:h-auto md:min-h-[50vh] md:min-w-3xl",
              fullscreen: "h-[calc(100vh-2rem)] md:min-w-3xl",
              compact: "h-[calc(100vh-2rem)] md:h-auto md:min-w-lg",
            }[size],
      )}
    >
      {(title || showClose) && (
        <div
          className={cn(
            "flex items-center border-b border-accent",
            showClose ? "justify-between p-2" : "p-3",
          )}
        >
          {title && (
            <h2
              className={cn(
                "text-sm",
                showClose ? "ml-2 text-content-muted" : "text-content-normal",
              )}
            >
              {title}
            </h2>
          )}
          {showClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAbandon}
              className="ml-auto"
            >
              <X className="size-3.5 text-content-muted" />
            </Button>
          )}
        </div>
      )}

      <ScrollArea
        className={cn(
          inline
            ? "h-auto"
            : {
                default: "min-h-[calc(100vh-6.5rem)] md:h-[50vh] md:min-h-auto",
                fullscreen: "min-h-[calc(100vh-6.5rem)]",
                compact: "min-h-[calc(100vh-6.5rem)] md:h-auto md:min-h-auto",
              }[size],
          className,
        )}
      >
        <div className="flex w-full justify-center">
          <div className="w-full p-6">{children}</div>
        </div>
      </ScrollArea>

      <div className="flex items-center gap-4 border-t border-accent p-3 md:justify-end">
        {resolvedShowCancel && (
          <Button
            variant="outline"
            type="button"
            onClick={handleAbandon}
            disabled={isPending}
            className="max-w-48 flex-1 basis-1/2"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="max-w-48 flex-1 basis-1/2"
        >
          {isPending ? <Loading.Dots className="bg-background" /> : submitLabel}
        </Button>
      </div>
    </div>
  )
}
