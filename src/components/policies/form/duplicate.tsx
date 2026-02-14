import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"

import { Form } from "@/components/ui/form"
import { toast } from "@/lib/toast"

import {
  useGetPolicy,
  useCreatePolicy,
  useListPolicyEntitlements,
  useAttachPolicyEntitlements,
} from "@/queries/policies"
import { useCreateEntitlement } from "@/queries/entitlements"
import { settleMutations } from "@/queries/utils"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Schemas from "@/schemas"
import { Entitlement, EntitlementErrorCode } from "@/types/entitlements"

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
  const { data: entitlements = [] } = useListPolicyEntitlements(id)

  const createPolicy = useCreatePolicy()
  const createEntitlement = useCreateEntitlement()
  const attachEntitlements = useAttachPolicyEntitlements("")

  const navigateToResource = useResourceNavigate()

  const defaultValues = useMemo(() => {
    if (!policy) return undefined
    const values =
      Schemas.Policies.getFormValuesFromPolicy<Schemas.Policies.CreateValues>(
        policy,
        { product: true },
      )
    return {
      ...values,
      name: `${values.name} (dup)`,
      entitlements: { attach: entitlements.map((e) => e.id), create: [] },
    }
  }, [policy, entitlements])

  const form = useForm<Schemas.Policies.CreateValues>({
    resolver: zodResolver(Schemas.Policies.CreateSchema),
    mode: "onChange",
    values: defaultValues,
  })

  const handleSubmit = useCallback(async () => {
    if (!policy) return
    await form.handleSubmit(async (values) => {
      const attachIds = values.entitlements?.attach ?? []
      const toCreate = values.entitlements?.create ?? []
      const [createdEntitlements, errors] = await settleMutations<Entitlement>(
        toCreate.map((attrs) => createEntitlement.mutateAsync(attrs)),
      )
      const entitlementIds = Array.from(
        new Set([...attachIds, ...createdEntitlements.map((e) => e.id)]),
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

      createPolicy.mutate(
        { ...values, entitlements: { attach: entitlementIds, create: [] } },
        {
          onSuccess: async (created) => {
            if (entitlementIds.length > 0)
              await attachEntitlements.mutateAsync(entitlementIds)
            toast({ message: "Policy created", variant: "success" })
            onOpenChange(false)
            await navigateToResource(created)
          },
          onError: () => {
            toast({ message: "Failed to create policy", variant: "error" })
          },
        },
      )
    })()
  }, [
    form,
    policy,
    createPolicy,
    createEntitlement,
    attachEntitlements,
    navigateToResource,
    onOpenChange,
  ])

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
    <Forms.Container.Dialog open={open} onOpenChange={onOpenChange} fullscreen>
      {policyLoading ? (
        <div className="flex w-full justify-center py-8">
          <Loading.Dots />
        </div>
      ) : policyError || !policy ? (
        <p className="text-center text-sm text-red-500">
          Failed to load policy.
        </p>
      ) : (
        <Form {...form}>
          <Forms.Layout.Sheet
            title="Duplicating an existing policy"
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isPending={
              createPolicy.isPending ||
              createEntitlement.isPending ||
              attachEntitlements.isPending
            }
            submitLabel="Create"
            fullscreen
          >
            <Forms.Section.Columns title="Attributes">
              <Forms.Section.Column>
                <Policies.Form.Fields
                  schema="create"
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
                <Policies.Form.Fields schema="create" include={["metadata"]} />
              </Forms.Section.Column>
              <Forms.Section.Column>
                <Policies.Form.Fields
                  schema="create"
                  include={["entitlements.attach", "entitlements.create"]}
                />
              </Forms.Section.Column>
            </Forms.Section.Columns>
          </Forms.Layout.Sheet>
        </Form>
      )}
    </Forms.Container.Dialog>
  )
}
