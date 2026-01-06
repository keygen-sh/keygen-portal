import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import { useCreateEntitlement } from "@/queries/entitlements"
import { settleMutations } from "@/queries/utils"

import * as Forms from "@/forms"
import { Policy } from "@/types/policies"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import * as Policies from "@/components/policies"
import DocumentationLink from "@/components/documentation-link"

interface EditFormProps {
  policy: Policy
  entitlementIds: string[]
  onUpdate: (values: Forms.Policies.UpdateValues) => Promise<void> | void
  onCancel: () => void
}

export default function EditForm({
  policy,
  entitlementIds,
  onUpdate,
  onCancel,
}: EditFormProps) {
  const form = useForm<Forms.Policies.UpdateValues>({
    resolver: zodResolver(Forms.Policies.UpdateSchema),
    mode: "onChange",
    defaultValues: {
      ...Forms.Policies.getFormValuesFromPolicy(policy),
      entitlements: {
        attach: entitlementIds,
        create: [],
      },
    },
  })

  const createEntitlement = useCreateEntitlement()

  const update = useCallback(
    async (values: Forms.Policies.UpdateValues) => {
      const attachIds = values.entitlements?.attach ?? []
      const toCreate = values.entitlements?.create ?? []

      const [entitlements, errors] = await settleMutations<Entitlement>(
        toCreate.map((attrs) => createEntitlement.mutateAsync(attrs)),
      )
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
          if (error.reason.code === EntitlementErrorCode.CodeTaken) {
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
        ...values,
        entitlements: {
          attach: entitlementIds,
          create: [],
        },
      })
    },
    [createEntitlement, form, onUpdate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit(update)()
        }}
      >
        <ScrollArea type="always" className="h-[calc(100dvh-8rem)]">
          <Policies.Fields.All omit={["product"]} />

          <DocumentationLink page="policies" />
        </ScrollArea>

        <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="max-w-48 flex-1 basis-1/2"
          >
            Cancel
          </Button>
          <Button type="submit" className="max-w-48 flex-1 basis-1/2">
            Update
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
