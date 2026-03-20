import { createContext, useContext } from "react"

export interface FormDialogGuardContextValue {
  abandon: (action?: () => void) => void
  close: () => void
}

export const FormDialogGuardContext =
  createContext<FormDialogGuardContextValue | null>(null)

export function useFormDialogGuardContext() {
  const context = useContext(FormDialogGuardContext)
  if (!context) {
    throw new Error(
      "useFormDialogGuardContext must be used within a FormDialogGuard",
    )
  }

  return context
}
