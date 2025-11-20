import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import { useCreateEntitlement } from "@/queries/entitlements"
import { partitionMutations } from "@/queries/utils"

import { Policy, PolicyFormValues } from "@/types/policies"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import * as Policies from "@/components/policies"
import DocumentationLink from "@/components/documentation-link"
import {
  BaseSchema,
  getFormValuesFromPolicy,
} from "@/components/policies/schema"

interface EditFormProps {
  policy: Policy
  onUpdate: (values: PolicyFormValues) => Promise<void> | void
  onCancel: () => void
}

export default function EditForm({
  policy,
  onUpdate,
  onCancel,
}: EditFormProps) {
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(BaseSchema),
    mode: "onChange",
    defaultValues: getFormValuesFromPolicy(policy),
  })

  const createEntitlement = useCreateEntitlement()

  const update = useCallback(
    async (payload: PolicyFormValues) => {
      const attachIds = payload.entitlements?.attach ?? []
      const toCreate = payload.entitlements?.create ?? []

      const results = await Promise.allSettled(
        toCreate.map(attrs =>
          createEntitlement.mutateAsync(attrs),
        ),
      )

      const [entitlements, errors] = partitionMutations<Entitlement>(results)
      const entitlementIds = Array.from(
        new Set([...attachIds, ...entitlements.map((e) => e.id)]),
      )

      if (errors.length > 0) {
        const nextAttach = [...entitlementIds]
        const nextCreate = errors.map(({ index }) => toCreate[index]) // to retry

        form.setValue("entitlements.attach", nextAttach)
        form.setValue("entitlements.create", nextCreate)

        errors.forEach((error, index) => {
          let message = ""
          if (error.reason.code === EntitlementErrorCode.CODE_TAKEN) {
            message = "Code already exists"
          } else {
            message = "Field is invalid"
          }

          form.setError(`entitlements.create.${index}.code`, {
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

      await onUpdate({
        ...payload,
        entitlements: {
          attach: entitlementIds,
          create: [],
        },
      })
    },
    [form, onUpdate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(update)()
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
            Update
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
