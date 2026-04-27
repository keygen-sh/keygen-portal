import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form"

import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import { settleMutations } from "@/queries/utils"

import { toast } from "@/lib/toast"

type EntitlementValues = {
  attach?: string[]
  create?: { name: string; code: string; metadata?: Record<string, unknown> }[]
}

interface SettleCreateEntitlementsProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>
  values?: EntitlementValues
  createMutation: {
    mutateAsync: (attributes: {
      name: string
      code: string
      metadata?: Record<string, unknown>
    }) => Promise<Entitlement>
  }
}

// Settles entitlement creation mutations and associated form state
export async function settleCreateEntitlements<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  form,
  values,
  createMutation,
}: SettleCreateEntitlementsProps<
  TFieldValues,
  TContext,
  TTransformedValues
>): Promise<string[] | null> {
  const attachIds = values?.attach ?? []
  const toCreate = values?.create ?? []

  const [created, errors] = await settleMutations<Entitlement>(
    toCreate.map((attributes) => createMutation.mutateAsync(attributes)),
  )
  const nextAttach = Array.from(
    new Set([...attachIds, ...created.map((e) => e.id)]),
  )
  const nextCreate = errors.map(({ index }) => toCreate[index])

  form.setValue(
    "entitlements.attach" as Path<TFieldValues>,
    nextAttach as PathValue<TFieldValues, Path<TFieldValues>>,
  )
  form.setValue(
    "entitlements.create" as Path<TFieldValues>,
    nextCreate as PathValue<TFieldValues, Path<TFieldValues>>,
  )

  if (errors.length > 0) {
    let message = "Field is invalid"
    errors.forEach((error, index) => {
      if (error.reason.code === EntitlementErrorCode.CodeTaken) {
        message = "Code already exists"
      }

      form.setError(`entitlements.create.${index}.code` as Path<TFieldValues>, {
        type: "validate",
        message,
      })
    })

    toast({
      message: "Failed to create entitlement(s)",
      description: message,
      variant: "error",
    })

    return null
  }

  return nextAttach
}
