import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form"

import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import { settleMutations } from "@/queries/utils"

import { toast } from "@/lib/toast"

type EntitlementValues = {
  attach?: string[]
  create?: { name: string; code: string }[]
}

interface SettleCreateEntitlementsProps<
  T extends FieldValues,
  TContext = unknown,
  TTransformedValues = T,
> {
  form: UseFormReturn<T, TContext, TTransformedValues>
  values?: EntitlementValues
  createMutation: {
    mutateAsync: (attributes: {
      name: string
      code: string
    }) => Promise<Entitlement>
  }
}

// Settles entitlement creation mutations and associated form state
export async function settleCreateEntitlements<
  T extends FieldValues & { entitlements?: EntitlementValues },
  TContext = unknown,
  TTransformedValues = T,
>({
  form,
  values,
  createMutation,
}: SettleCreateEntitlementsProps<T, TContext, TTransformedValues>): Promise<
  string[] | null
> {
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
    "entitlements.attach" as Path<T>,
    nextAttach as PathValue<T, Path<T>>,
  )
  form.setValue(
    "entitlements.create" as Path<T>,
    nextCreate as PathValue<T, Path<T>>,
  )

  if (errors.length > 0) {
    let message = "Field is invalid"
    errors.forEach((error, index) => {
      if (error.reason.code === EntitlementErrorCode.CodeTaken) {
        message = "Code already exists"
      }

      form.setError(`entitlements.create.${index}.code` as Path<T>, {
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
