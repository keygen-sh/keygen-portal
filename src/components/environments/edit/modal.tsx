import { useCallback } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Environment } from "@/types/environments"
import { MODES } from "@/constants/environments"

import EditForm from "./edit-form"

interface EnvironmentsViewModalProps {
  open: boolean
  onClose: () => void
  selectedEnvironment: Environment
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: MODES, env?: Environment) => void
}

export default function EnvironmentsViewModal({
  open,
  onClose,
  selectedEnvironment,
  onChangeMode,
}: EnvironmentsViewModalProps) {
  const handleSaveEnvironment = useCallback(
    (updatedEnvironment: Environment) => {
      // TODO(cazden) - Implement save logic
      onChangeMode(MODES.VIEW, updatedEnvironment)
    },
    [onChangeMode],
  )

  const handleCancelEdit = useCallback(() => {
    onChangeMode(MODES.VIEW)
  }, [onChangeMode])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex min-w-[700px] flex-col justify-between p-0 transition-all duration-300">
        <DialogHeader className="h-fit border-b border-accent p-4">
          <DialogTitle>{selectedEnvironment?.name || ""}</DialogTitle>
        </DialogHeader>

        <EditForm
          environment={selectedEnvironment}
          onSaveEnvironment={handleSaveEnvironment}
          onCancelEdit={handleCancelEdit}
        />
      </DialogContent>
    </Dialog>
  )
}
