import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useBlocker } from "@tanstack/react-router"

import UnsavedChangesModal from "@/components/unsaved-changes-modal"

import { FormDialogGuardContext } from "@/contexts/form-dialog-guard-context"

// FormRouteGuard blocks and confirms routing navigation when the form is dirty
export function FormRouteGuard({ children }: { children: React.ReactNode }) {
  const form = useFormContext()
  const { isDirty, isSubmitting } = form.formState

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => isDirty && !isSubmitting,
    withResolver: true,
    enableBeforeUnload: false,
  })

  const handleConfirm = useCallback(() => {
    proceed?.()
  }, [proceed])

  const handleCancel = useCallback(() => {
    reset?.()
  }, [reset])

  return (
    <>
      {children}
      <UnsavedChangesModal
        open={status === "blocked"}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  )
}

interface FormDialogGuardProps {
  onClose: () => void
  children: React.ReactNode
}

// FormDialogGuard intercepts and confirms dialog close when the form is dirty
export function FormDialogGuard({ onClose, children }: FormDialogGuardProps) {
  const form = useFormContext()
  const { isDirty } = form.formState
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const close = useCallback(() => {
    form.reset()
    onClose()
  }, [form, onClose])

  const abandon = useCallback(
    (callback?: () => void) => {
      const action = callback ?? onClose

      if (isDirty) {
        setPendingAction(() => action)
        return
      }

      form.reset()
      action()
    },
    [isDirty, form, onClose],
  )

  const handleConfirm = useCallback(() => {
    const action = pendingAction
    setPendingAction(null)
    form.reset()
    action?.()
  }, [form, pendingAction])

  const handleCancel = useCallback(() => {
    setPendingAction(null)
  }, [])

  return (
    <FormDialogGuardContext.Provider value={{ abandon, close }}>
      {children}
      <UnsavedChangesModal
        open={pendingAction !== null}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </FormDialogGuardContext.Provider>
  )
}
