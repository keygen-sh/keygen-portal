import {
  type FieldValues,
  type UseFormReturn,
  FormProvider,
} from "react-hook-form"

import { FormRouteGuard } from "@/components/forms/guard"

interface FormsProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>
  guard?: boolean
  children: React.ReactNode
}

export default function FormsProvider<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  form,
  guard = true,
  children,
}: FormsProviderProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <FormProvider {...form}>
      {guard ? <FormRouteGuard>{children}</FormRouteGuard> : children}
    </FormProvider>
  )
}
