import { useMemo, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import { settleMutations } from "@/queries/utils"
import { useCreateEntitlement } from "@/queries/entitlements"

import * as Forms from "@/forms"
import { Policy } from "@/types/policies"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import * as Policies from "@/components/policies"
import DocumentationLink from "@/components/documentation-link"

interface DuplicateFormProps {
  policy: Policy
  onCreate: (values: Forms.Policies.BaseValues) => Promise<void> | void
  onCancel: () => void
}

export default function DuplicateForm({
  policy,
  onCreate,
  onCancel,
}: DuplicateFormProps) {
  const defaultValues = useMemo(() => {
    const values = Forms.Policies.getFormValuesFromPolicy(policy)
    return {
      ...values,
      name: `${values.name} (dup)`,
    }
  }, [policy])

  const form = useForm<Forms.Policies.BaseValues>({
    resolver: zodResolver(Forms.Policies.BaseSchema),
    mode: "onChange",
    defaultValues,
  })

  const createEntitlement = useCreateEntitlement()

  const create = useCallback(
    async (payload: Forms.Policies.BaseValues) => {
      const attachIds = payload.entitlements?.attach ?? []
      const toCreate = payload.entitlements?.create ?? []

      const [entitlements, errors] = await settleMutations<Entitlement>(
        toCreate.map((attrs) => createEntitlement.mutateAsync(attrs)),
      )
      const entitlementIds = Array.from(
        new Set([...attachIds, ...entitlements.map((e) => e.id)]),
      )

      if (errors.length > 0) {
        const nextAttach = [...entitlementIds]
        const nextCreate = errors.map(({ index }) => toCreate[index])

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

      await onCreate({
        ...payload,
        entitlements: {
          attach: entitlementIds,
          create: [],
        },
      })
    },
    [createEntitlement, form, onCreate],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await form.handleSubmit(create)()
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
