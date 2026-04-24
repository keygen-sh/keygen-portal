import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { toast } from "@/lib/toast"

import {
  useGetPolicy,
  useCreatePolicy,
  useListPolicyEntitlements,
  useAttachPolicyEntitlements,
} from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Schemas from "@/schemas"

import { PolicyMode } from "@/types/policies"
import { settleCreateEntitlements } from "@/lib/entitlements"

import * as Forms from "@/components/forms"
import * as Loading from "@/components/loading"
import * as Policies from "@/components/policies"
import { Separator } from "@/components/ui/separator"

interface DuplicatePolicyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DuplicatePolicyForm({
  open,
  onOpenChange,
}: DuplicatePolicyFormProps) {
  const { id } = useParams({ from: "/$accountId/app/policies/$id" })
  const {
    data: policy,
    isLoading: policyLoading,
    isError: policyError,
  } = useGetPolicy(id)
  const { data: policyEntitlements = [] } = useListPolicyEntitlements(id)

  const createPolicy = useCreatePolicy()
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachPolicyEntitlements()

  const navigateToResource = useResourceNavigate()
  const mode = PolicyMode.Duplicate

  const defaultValues = useMemo(() => {
    if (!policy) return undefined
    const values =
      Schemas.Policies.getFormValuesFromPolicy<Schemas.Policies.CreateFormValues>(
        policy,
        { product: true },
      )
    return {
      ...values,
      name: `${values.name} (dup)`,
      entitlements: { attach: policyEntitlements.map((e) => e.id), create: [] },
    }
  }, [policy, policyEntitlements])

  const form = useForm<
    Schemas.Policies.CreateFormValues,
    unknown,
    Schemas.Policies.CreateValues
  >({
    resolver: zodResolver(Schemas.Policies.CreateSchema),
    mode: "onChange",
    values: defaultValues,
  })

  const handleSubmit = useCallback(
    async (values: Schemas.Policies.CreateValues) => {
      if (!policy) return

      const createdEntitlementIds = await settleCreateEntitlements({
        form,
        createMutation: createEntitlement,
        values: values.entitlements,
      })
      if (!createdEntitlementIds) return

      const created = await createPolicy.mutateAsync({
        ...values,
        entitlements: { attach: [], create: [] },
      })

      if (createdEntitlementIds.length > 0)
        await attachEntitlements.mutateAsync({
          policyId: created.id,
          entitlementIds: createdEntitlementIds,
        })

      toast({ message: "Policy created", variant: "success" })
      await navigateToResource(created)
    },
    [
      form,
      policy,
      createPolicy,
      createEntitlement,
      attachEntitlements,
      navigateToResource,
    ],
  )

  if (policyLoading) {
    return (
      <div className="flex w-full justify-center py-8">
        <Loading.Dots />
      </div>
    )
  }

  if (policyError || !policy) {
    return (
      <p className="text-center text-sm text-red-500">Failed to load policy.</p>
    )
  }

  return (
    <Forms.Provider form={form}>
      <Forms.Container.Dialog
        open={open}
        onOpenChange={onOpenChange}
        size="fullscreen"
      >
        {policyLoading ? (
          <div className="flex w-full justify-center py-8">
            <Loading.Dots />
          </div>
        ) : policyError || !policy ? (
          <p className="text-center text-sm text-red-500">
            Failed to load policy.
          </p>
        ) : (
          <Forms.Layout.Sheet
            title="Duplicating an existing policy"
            onSubmit={handleSubmit}
            errorMessage="Failed to create policy"
            isPending={
              createPolicy.isPending ||
              createEntitlement.isPending ||
              attachEntitlements.isPending
            }
            submitLabel="Create"
            size="fullscreen"
          >
            <Forms.Section.Columns title="Attributes">
              <Forms.Section.Column>
                <Policies.Form.Fields
                  schema="create"
                  mode={mode}
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
                  schema="create"
                  mode={mode}
                  include={[
                    "maxUses",
                    "maxUsers",
                    "name",
                    "overageStrategy",
                    "processLeasingStrategy",
                    "product",
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
                  schema="create"
                  mode={mode}
                  include={["metadata"]}
                />
              </Forms.Section.Column>
              <Forms.Section.Column>
                <Policies.Form.Fields
                  schema="create"
                  mode={mode}
                  include={["entitlements.attach", "entitlements.create"]}
                />
              </Forms.Section.Column>
            </Forms.Section.Columns>
          </Forms.Layout.Sheet>
        )}
      </Forms.Container.Dialog>
    </Forms.Provider>
  )
}
