import ConfirmationModal from "@/components/confirmation-modal"

interface UnsavedChangesModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function UnsavedChangesModal({
  open,
  onClose,
  onConfirm,
}: UnsavedChangesModalProps) {
  return (
    <ConfirmationModal
      title="Unsaved changes"
      description="You have unsaved changes that will be lost. Are you sure you want to continue?"
      label="Discard"
      variant="destructive"
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
}
