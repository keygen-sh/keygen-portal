import {
  type FieldValues,
  type UseFormReturn,
  FormProvider,
} from "react-hook-form"

import { FormRouteGuard } from "@/components/forms/guard"

interface FormsProviderProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>
  children: React.ReactNode
}

export default function FormsProvider<T extends FieldValues = FieldValues>({
  form,
  children,
}: FormsProviderProps<T>) {
  return (
    <FormProvider {...form}>
      <FormRouteGuard>{children}</FormRouteGuard>
    </FormProvider>
  )
}
