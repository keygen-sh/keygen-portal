import { useMemo, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import { useCreateEntitlement } from "@/queries/entitlements"

import { Policy, PolicyFormValues } from "@/types/policies"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import * as Policies from "@/components/policies"
import DocumentationLink from "@/components/documentation-link"
import {
  BaseSchema,
  getFormValuesFromPolicy,
} from "@/components/policies/schema"

interface DuplicateFormProps {
  policy: Policy
  onCreate: (values: PolicyFormValues) => void
  onCancel: () => void
}

export default function DuplicateForm({
  policy,
  onCreate,
  onCancel,
}: DuplicateFormProps) {
  const defaultValues = useMemo(() => {
    const values = getFormValuesFromPolicy(policy)
    return {
      ...values,
      name: `${values.name} (dup)`,
    }
  }, [policy])

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(BaseSchema),
    mode: "onChange",
    defaultValues,
  })

  const createEntitlement = useCreateEntitlement()

  const handleSubmit = useCallback(
    async (payload: PolicyFormValues) => {
      const attachIds = payload.entitlements?.attach ?? []
      const toCreate = payload.entitlements?.create ?? []

      const entitlementsResults = await Promise.allSettled(
        toCreate.map((e) =>
          createEntitlement.mutateAsync({
            name: e.name,
            code: e.code,
            metadata: e.metadata ?? {},
          }),
        ),
      )

      const succeeded = entitlementsResults
        .map((result, index) => (result.status === "fulfilled" ? index : -1))
        .filter((index) => index !== -1)
      const failed = entitlementsResults
        .map((result, index) => (result.status === "rejected" ? index : -1))
        .filter((index) => index !== -1)

      const createdEntitlements = succeeded.map(
        (index) =>
          (entitlementsResults[index] as PromiseFulfilledResult<Entitlement>)
            .value,
      )

      if (failed.length > 0) {
        const nextAttach = Array.from(
          new Set([...attachIds, ...createdEntitlements.map((e) => e.id)]),
        )
        const nextCreate = failed.map((index) => toCreate[index])

        form.setValue("entitlements.attach", nextAttach)
        form.setValue("entitlements.create", nextCreate)

        failed.forEach((index, newIndex) => {
          const result = entitlementsResults[index]

          let message = ""
          if (
            result.status === "rejected" &&
            result.reason?.code === EntitlementErrorCode.CODE_TAKEN
          ) {
            message = "Code already exists"
          } else {
            message = "Field is invalid"
          }

          form.setError(`entitlements.create.${newIndex}.code`, {
            type: "validate",
            message,
          })
        })

        toast({
          message: "Failed to create entitlement(s)",
          variant: "error",
        })

        return
      }

      const entitlementIds = Array.from(
        new Set([...attachIds, ...createdEntitlements.map((e) => e.id)]),
      )

      await onCreate({
        ...payload,
        entitlements: {
          attach: entitlementIds,
          create: [],
        },
      })
    },
    [form, onCreate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(handleSubmit)()
        }}
      >
        <ScrollArea type="always" className="h-[calc(100dvh-8rem)]">
          <Policies.Fields.All />

          <DocumentationLink page="policies" />
        </ScrollArea>

        <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="max-w-[12rem] flex-1 basis-1/2"
          >
            Cancel
          </Button>
          <Button type="submit" className="max-w-[12rem] flex-1 basis-1/2">
            Create
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
