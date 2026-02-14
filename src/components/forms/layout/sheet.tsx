import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { cn } from "@/lib/utils"

import * as Loading from "@/components/loading"

interface FormsContentSheetProps {
  title: string
  onSubmit: () => void
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string
  isPending?: boolean
  fullscreen?: boolean
  children: React.ReactNode
  className?: string
}

export default function FormsContentSheet({
  title,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isPending = false,
  fullscreen = false,
  children,
  className,
}: FormsContentSheetProps) {
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
          onClick={onCancel}
          disabled={isPending}
          className="max-w-48 flex-1 basis-1/2"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="max-w-48 flex-1 basis-1/2"
        >
          {isPending ? <Loading.Dots className="bg-background" /> : submitLabel}
        </Button>
      </div>
    </div>
  )
}
