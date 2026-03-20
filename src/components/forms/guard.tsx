import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useBlocker } from "@tanstack/react-router"

import UnsavedChangesModal from "@/components/unsaved-changes-modal"

import { FormDialogGuardContext } from "@/contexts/form-dialog-guard-context"

// FormRouteGuard blocks and confirms routing navigation when the form is dirty
export function FormRouteGuard({ children }: { children: React.ReactNode }) {
  const form = useFormContext()
  const { isDirty } = form.formState

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => isDirty,
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
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

// FormDialogGuard intercepts and confirms dialog close when the form is dirty
export function FormDialogGuard({
  onOpenChange,
  children,
}: FormDialogGuardProps) {
  const form = useFormContext()
  const { isDirty } = form.formState
  const [closeBlocked, setCloseBlocked] = useState(false)

  const guardedOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isDirty) {
        setCloseBlocked(true)
        return
      }

      if (!nextOpen) {
        form.reset()
      }

      onOpenChange(nextOpen)
    },
    [isDirty, onOpenChange, form],
  )

  const handleConfirm = useCallback(() => {
    setCloseBlocked(false)
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleCancel = useCallback(() => {
    setCloseBlocked(false)
  }, [])

  return (
    <FormDialogGuardContext.Provider value={{ guardedOpenChange }}>
      {children}
      <UnsavedChangesModal
        open={closeBlocked}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </FormDialogGuardContext.Provider>
  )
}
