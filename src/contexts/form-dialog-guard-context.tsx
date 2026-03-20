import { createContext, useContext } from "react"

export interface FormDialogGuardContextValue {
  abandonForm: (action?: () => void) => void
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
