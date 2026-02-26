import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"

import { toast } from "@/lib/toast"

import {
  useGetPolicy,
  useUpdatePolicy,
  useListPolicyEntitlements,
  useAttachPolicyEntitlements,
  useDetachPolicyEntitlements,
} from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"
import { settleMutations } from "@/queries/utils"

import * as Schemas from "@/schemas"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

import * as Forms from "@/components/forms"
import * as Policies from "@/components/policies"
import { Separator } from "@/components/ui/separator"

interface EditPolicyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditPolicyForm({
  open,
  onOpenChange,
}: EditPolicyFormProps) {
  const { id } = useParams({ from: "/$accountId/app/policies/$id" })
  const { data: policy } = useGetPolicy(id)
  const { data: currentEntitlements = [] } = useListPolicyEntitlements(
    policy?.id ?? "",
  )

  const updatePolicy = useUpdatePolicy(policy?.id ?? "")
  const attachEntitlements = useAttachPolicyEntitlements(policy?.id ?? "")
  const detachEntitlements = useDetachPolicyEntitlements(policy?.id ?? "")
  const createEntitlement = useCreateEntitlement()

  const form = useForm<Schemas.Policies.UpdateValues>({
    resolver: zodResolver(Schemas.Policies.UpdateSchema),
    mode: "onChange",
    values: policy
      ? {
          ...Schemas.Policies.getFormValuesFromPolicy(policy),
          entitlements: {
            attach: currentEntitlements.map((e) => e.id),
            create: [],
          },
        }
      : undefined,
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Policies.UpdateValues) => {
      if (!policy) return

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
        toast({ message: "Failed to create entitlement(s)", variant: "error" })
        return
      }

      const currentIds = currentEntitlements.map((e) => e.id)
      const newIds = entitlementIds
      const toAttach = newIds.filter((id) => !currentIds.includes(id))
      const toDetach = currentIds.filter((id) => !newIds.includes(id))

      if (toDetach.length > 0) await detachEntitlements.mutateAsync(toDetach)
      if (toAttach.length > 0) await attachEntitlements.mutateAsync(toAttach)
      await updatePolicy.mutateAsync({
        ...values,
        entitlements: { attach: entitlementIds, create: [] },
      })
      toast({ message: "Policy updated", variant: "success" })
      onOpenChange(false)
    },
    [
      form,
      policy,
      onOpenChange,
      updatePolicy,
      currentEntitlements,
      attachEntitlements,
      detachEntitlements,
      createEntitlement,
    ],
  )

  return (
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange} fullscreen>
      <Form {...form}>
        <Forms.Layout.Sheet
          title="Editing an existing policy"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          errorMessage="Failed to update policy"
          isPending={
            updatePolicy.isPending ||
            attachEntitlements.isPending ||
            detachEntitlements.isPending ||
            createEntitlement.isPending
          }
          submitLabel="Update"
          fullscreen
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Policies.Form.Fields
                schema="edit"
                include={[
                  "authenticationStrategy",
                  "checkInInterval",
                  "checkInIntervalCount",
                  "componentMatchingStrategy",
                  "componentUniquenessStrategy",
                  "duration",
                  "expirationBasis",
                  "expirationStrategy",
                  "floating",
                  "heartbeatBasis",
                  "heartbeatCullStrategy",
                  "heartbeatDuration",
                  "heartbeatResurrectionStrategy",
                  "machineLeasingStrategy",
                  "machineMatchingStrategy",
                  "machineUniquenessStrategy",
                  "maxCores",
                  "maxMachines",
                  "maxProcesses",
                ]}
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Policies.Form.Fields
                schema="edit"
                include={[
                  "maxUses",
                  "maxUsers",
                  "name",
                  "overageStrategy",
                  "processLeasingStrategy",
                  "protected",
                  "renewalBasis",
                  "requireCheckIn",
                  "requireChecksumScope",
                  "requireComponentsScope",
                  "requireFingerprintScope",
                  "requireHeartbeat",
                  "requireMachineScope",
                  "requirePolicyScope",
                  "requireProductScope",
                  "requireUserScope",
                  "requireVersionScope",
                  "strict",
                  "transferStrategy",
                  "usePool",
                ]}
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>

          <Separator className="my-8" />

          <Forms.Section.Columns>
            <Forms.Section.Column>
              <Policies.Form.Fields schema="edit" include={["metadata"]} />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Policies.Form.Fields
                schema="edit"
                include={["entitlements.attach", "entitlements.create"]}
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Form>
    </Forms.Container.Dialog>
  )
}
