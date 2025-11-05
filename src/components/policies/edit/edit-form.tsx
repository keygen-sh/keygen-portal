import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DialogFooter } from "@/components/ui/dialog"

import { Policy, PolicyFormValues } from "@/types/policies"

import * as Policies from "@/components/policies"
import DocumentationLink from "@/components/documentation-link"
import {
  BaseSchema,
  getFormValuesFromPolicy,
} from "@/components/policies/schema"

interface EditFormProps {
  policy: Policy
  onSubmit: (values: PolicyFormValues) => void
  onCancel: () => void
}

export default function EditForm({
  policy,
  onSubmit,
  onCancel,
}: EditFormProps) {
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(BaseSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: getFormValuesFromPolicy(policy),
    shouldUnregister: true,
  })

  const handleSubmit = useCallback(
    (values: PolicyFormValues) => onSubmit(values),
    [onSubmit],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
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
