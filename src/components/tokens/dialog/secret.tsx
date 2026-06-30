import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import ClipboardValue from "@/components/clipboard-value"

interface TokenSecretDialogProps {
  secret: string | null
  onClose: () => void
}

export default function TokenSecretDialog({
  secret,
  onClose,
}: TokenSecretDialogProps) {
  return (
    <AlertDialog open={!!secret} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="p-0">
        <AlertDialogHeader className="px-6 pt-6 text-start">
          <AlertDialogTitle className="text-base">
            Save your token
          </AlertDialogTitle>
          <AlertDialogDescription>
            This is the only time we'll show this token. Copy it and store it
            somewhere safe — you won't be able to retrieve it again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-6 py-4">
          {secret && <ClipboardValue value={secret} />}
        </div>
        <AlertDialogFooter className="gap-4 border-t border-accent p-4">
          <Button onClick={onClose}>Done</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
