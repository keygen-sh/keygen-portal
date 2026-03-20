import { useCallback, useMemo, useState } from "react"
import { useFormContext, useFormState } from "react-hook-form"
import { useBlocker } from "@tanstack/react-router"

import UnsavedChangesModal from "@/components/unsaved-changes-modal"

import { FormDialogGuardContext } from "@/contexts/form-dialog-guard-context"

// FormRouteGuard blocks and confirms routing navigation when the form is dirty
export function FormRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FormRouteGuardModal />
    </>
  )
}

// NB(ezekg) FormRouteGuardModal isolates isDirty/isSubmitting subscriptions outside
//           of the main guard to avoid unnecessary re-renders of its children
function FormRouteGuardModal() {
  const { control } = useFormContext()
  const { isDirty, isSubmitting } = useFormState({ control })

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
    <UnsavedChangesModal
      open={status === "blocked"}
      onClose={handleCancel}
      onConfirm={handleConfirm}
    />
  )
}

interface FormDialogGuardProps {
  onClose: () => void
  children: React.ReactNode
}

// FormDialogGuard intercepts and confirms dialog close when the form is dirty
export function FormDialogGuard({ onClose, children }: FormDialogGuardProps) {
  const form = useFormContext()

  // NB(ezekg) isolate isDirty subscription to avoid unnecessary re-renders
  const { isDirty } = useFormState({
    control: form.control,
  })

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
    [form, onClose, isDirty],
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

  const contextValue = useMemo(() => ({ abandon, close }), [abandon, close])

  return (
    <FormDialogGuardContext.Provider value={contextValue}>
      {children}
      <UnsavedChangesModal
        open={pendingAction !== null}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </FormDialogGuardContext.Provider>
  )
}
