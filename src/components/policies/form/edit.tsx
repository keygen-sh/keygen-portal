import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"

import { transformingZodResolver } from "@/lib/form"

import { toast } from "@/lib/toast"

import {
  useGetPolicy,
  useUpdatePolicy,
  useListPolicyEntitlements,
  useAttachPolicyEntitlements,
  useDetachPolicyEntitlements,
} from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"

import * as Schemas from "@/schemas"

import { settleCreateEntitlements } from "@/lib/entitlements"

import { PolicyMode } from "@/types/policies"

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
  const { data: policyEntitlements = [] } = useListPolicyEntitlements(
    policy?.id ?? "",
  )

  const updatePolicy = useUpdatePolicy(policy?.id ?? "")
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachPolicyEntitlements()
  const detachEntitlements = useDetachPolicyEntitlements()

  const form = useForm<
    Schemas.Policies.UpdateFormValues,
    unknown,
    Schemas.Policies.UpdateValues
  >({
    resolver: transformingZodResolver(Schemas.Policies.UpdateSchema),
    mode: "onChange",
    values: policy
      ? {
          ...Schemas.Policies.getFormValuesFromPolicy(policy),
          entitlements: {
            attach: policyEntitlements.map((e) => e.id),
            create: [],
          },
        }
      : undefined,
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Policies.UpdateValues) => {
      if (!policy) return

      const createdEntitlementIds = await settleCreateEntitlements({
        form,
        createMutation: createEntitlement,
        values: values.entitlements,
      })
      if (!createdEntitlementIds) return

      const attachEntitlementIds = createdEntitlementIds.filter(
        (id) => !policyEntitlements.some((e) => e.id === id),
      )
      const detachEntitlementIds = policyEntitlements
        .filter((e) => !createdEntitlementIds.includes(e.id))
        .map((e) => e.id)

      if (detachEntitlementIds.length > 0)
        await detachEntitlements.mutateAsync({
          policyId: policy.id,
          entitlementIds: detachEntitlementIds,
        })
      if (attachEntitlementIds.length > 0)
        await attachEntitlements.mutateAsync({
          policyId: policy.id,
          entitlementIds: attachEntitlementIds,
        })

      await updatePolicy.mutateAsync(values)
      toast({ message: "Policy updated", variant: "success" })
    },
    [
      form,
      policy,
      updatePolicy,
      policyEntitlements,
      attachEntitlements,
      detachEntitlements,
      createEntitlement,
    ],
  )

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="fullscreen"
      >
        <Forms.Layout.Sheet
          title="Editing an existing policy"
          onSubmit={handleSubmit}
          errorMessage="Failed to update policy"
          isPending={
            updatePolicy.isPending ||
            attachEntitlements.isPending ||
            detachEntitlements.isPending ||
            createEntitlement.isPending
          }
          submitLabel="Update"
          size="fullscreen"
        >
          <Forms.Section.Columns title="Attributes">
            <Forms.Section.Column>
              <Policies.Form.Fields
                schema="edit"
                mode={PolicyMode.Edit}
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
                mode={PolicyMode.Edit}
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
              <Policies.Form.Fields
                schema="edit"
                mode={PolicyMode.Edit}
                include={["metadata"]}
              />
            </Forms.Section.Column>
            <Forms.Section.Column>
              <Policies.Form.Fields
                schema="edit"
                mode={PolicyMode.Edit}
                include={["entitlements.attach", "entitlements.create"]}
              />
            </Forms.Section.Column>
          </Forms.Section.Columns>
        </Forms.Layout.Sheet>
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
