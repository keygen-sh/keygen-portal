import {
  useId,
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
} from "react"
import { useFormContext, useFormState } from "react-hook-form"
import { useBlocker } from "@tanstack/react-router"

import UnsavedChangesModal from "@/components/unsaved-changes-modal"

import { FormGuardContext } from "@/contexts/form-guard-context"

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
  const { isDirty, isSubmitting, touchedFields } = useFormState({ control })

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () =>
      isDirty && !isSubmitting && Object.keys(touchedFields).length > 0,
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
    <FormGuardContext.Provider value={contextValue}>
      {children}
      <UnsavedChangesModal
        open={pendingAction !== null}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </FormGuardContext.Provider>
  )
}

interface FormRouteGuardRegistryValue {
  setDirty: (id: string, dirty: boolean) => void
}

const FormRouteGuardRegistryContext =
  createContext<FormRouteGuardRegistryValue | null>(null)

export function FormPageRouteGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const dirtyRef = useRef(new Set<string>())
  const [hasDirty, setHasDirty] = useState(false)

  const setDirty = useCallback((id: string, dirty: boolean) => {
    if (dirty) {
      dirtyRef.current.add(id)
    } else {
      dirtyRef.current.delete(id)
    }

    setHasDirty(dirtyRef.current.size > 0)
  }, [])

  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => hasDirty,
    withResolver: true,
    enableBeforeUnload: false,
  })

  const handleConfirm = useCallback(() => {
    proceed?.()
  }, [proceed])

  const handleCancel = useCallback(() => {
    reset?.()
  }, [reset])

  const value = useMemo(() => ({ setDirty }), [setDirty])

  return (
    <FormRouteGuardRegistryContext.Provider value={value}>
      {children}
      <UnsavedChangesModal
        open={status === "blocked"}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </FormRouteGuardRegistryContext.Provider>
  )
}

interface FormPageGuardProps {
  children: React.ReactNode
}

export function FormPageGuard({ children }: FormPageGuardProps) {
  const form = useFormContext()
  const id = useId()
  const registry = useContext(FormRouteGuardRegistryContext)

  const { isDirty } = useFormState({
    control: form.control,
  })

  useEffect(() => {
    registry?.setDirty(id, isDirty)

    return () => registry?.setDirty(id, false)
  }, [id, isDirty, registry])

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const close = useCallback(() => {
    form.reset()
  }, [form])

  const abandon = useCallback(
    (callback?: () => void) => {
      const action = callback ?? (() => form.reset())

      if (isDirty) {
        setPendingAction(() => action)
        return
      }

      form.reset()
      action()
    },
    [form, isDirty],
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
    <FormGuardContext.Provider value={contextValue}>
      {children}
      <UnsavedChangesModal
        open={pendingAction !== null}
        onClose={handleCancel}
        onConfirm={handleConfirm}
      />
    </FormGuardContext.Provider>
  )
}
