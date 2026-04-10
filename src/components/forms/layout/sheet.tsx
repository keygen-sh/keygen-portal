import { useCallback } from "react"
import { useFormContext, type FieldValues } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { APIError } from "@/types/api"

import { cn } from "@/lib/utils"
import { handleFormError } from "@/lib/form-errors"

import { useSubmitOnce } from "@/hooks/use-submit-once"

import { useFormGuardContext } from "@/contexts/form-guard-context"

import * as Loading from "@/components/loading"

interface FormsContentSheetProps<T extends FieldValues = FieldValues> {
  title: string
  onSubmit: (data: T) => void | Promise<void>
  errorMessage?: string
  submitLabel?: string
  cancelLabel?: string
  isPending?: boolean
  fullscreen?: boolean
  children: React.ReactNode
  className?: string
}

export default function FormsContentSheet<T extends FieldValues = FieldValues>({
  title,
  onSubmit,
  errorMessage,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isPending = false,
  fullscreen = false,
  children,
  className,
}: FormsContentSheetProps<T>) {
  const form = useFormContext()
  const guard = useFormGuardContext()

  const [submitOnce, resetSubmitOnce] = useSubmitOnce(async () => {
    await form.handleSubmit(
      async (data) => {
        try {
          await onSubmit(data as T)
          guard.close()
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
      },
      () => {
        throw new Error(`Validation error: ${errorMessage ?? "invalid"}`)
      },
    )()
  })

  const handleSubmit = useCallback(async () => {
    try {
      await submitOnce()
    } catch {
      resetSubmitOnce()
    }
  }, [submitOnce, resetSubmitOnce])

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-2rem)] flex-col md:min-w-3xl",
        !fullscreen && "md:h-auto md:min-h-[50vh]",
      )}
    >
      <div className="flex items-center border-b border-accent p-3">
        <h2 className="text-sm text-content-normal">{title}</h2>
      </div>

      <ScrollArea
        className={cn(
          "min-h-[calc(100vh-6.5rem)]",
          !fullscreen && "md:h-[50vh] md:min-h-auto",
          className,
        )}
      >
        <div className="flex w-full justify-center">
          <div className="w-full p-6">{children}</div>
        </div>
      </ScrollArea>

      <div className="flex items-center gap-4 border-t border-accent p-3 md:justify-end">
        <Button
          variant="outline"
          type="button"
          onClick={() => guard.abandon()}
          disabled={isPending}
          className="max-w-48 flex-1 basis-1/2"
        >
          {cancelLabel}
        </Button>
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
