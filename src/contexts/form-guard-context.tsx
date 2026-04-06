import { createContext, useContext } from "react"

export interface FormGuardContextValue {
  abandon: (action?: () => void) => void
  close: () => void
}

export const FormGuardContext = createContext<FormGuardContextValue | null>(
  null,
)

export function useFormGuardContext() {
  const context = useContext(FormGuardContext)
  if (!context) {
    throw new Error(
      "useFormGuardContext must be used within a FormDialogGuard or FormPageGuard",
    )
  }

  return context
}
