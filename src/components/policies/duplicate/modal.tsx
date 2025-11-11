import { useState } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/lib/toast"

import { MockPolicies, Policy, PolicyFormValues } from "@/types/policies"
import DuplicateForm from "./duplicate-form"
import * as Loading from "@/components/loading"
import * as keygen from "@/keygen"

interface PoliciesDuplicateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PoliciesDuplicateModal({
  open,
  onOpenChange,
}: PoliciesDuplicateModalProps) {
  const { policyId } = useParams({ from: "/$id/app/policies/$policyId" })
  const policy = MockPolicies.find((p) => p.id === policyId)
  const [policyLoading] = useState(false)
  const [policyFetching] = useState(false)
  const policyError = false

  const navigate = useNavigate()

  const handleCreatePolicy = (values: PolicyFormValues) => {
    if (!policy) return

    onOpenChange(false)

    const now = new Date().toISOString()
    const newId = crypto.randomUUID()

    const created: Policy = {
      ...policy,
      id: newId,
      links: { self: `/v1/accounts/{ACCOUNT}/policies/${newId}` },
      attributes: {
        ...policy.attributes,
        name: values.name ?? "",
        created: now,
        updated: now,
        metadata: values.metadata ?? policy.attributes.metadata ?? {},
        duration: values.duration ?? null,
        expirationStrategy:
          values.expirationStrategy ?? policy.attributes.expirationStrategy,
        expirationBasis:
          values.expirationBasis ?? policy.attributes.expirationBasis,
        renewalBasis: values.renewalBasis ?? policy.attributes.renewalBasis,
        transferStrategy:
          values.transferStrategy ?? policy.attributes.transferStrategy,
        strict: values.strict ?? policy.attributes.strict,
        floating: values.floating ?? policy.attributes.floating,
        protected: values.protected ?? policy.attributes.protected,
        usePool: values.usePool ?? policy.attributes.usePool,
        checkInInterval: values.checkInInterval ?? null,
        checkInIntervalCount: values.checkInIntervalCount ?? null,
        maxMachines: values.maxMachines ?? null,
        maxProcesses: values.maxProcesses ?? null,
        maxUsers: values.maxUsers ?? null,
        maxUses: values.maxUses ?? null,
        maxCores: values.maxCores ?? null,
        requireCheckIn:
          values.requireCheckIn ?? policy.attributes.requireCheckIn,
        requireProductScope:
          values.requireProductScope ?? policy.attributes.requireProductScope,
        requirePolicyScope:
          values.requirePolicyScope ?? policy.attributes.requirePolicyScope,
        requireMachineScope:
          values.requireMachineScope ?? policy.attributes.requireMachineScope,
        requireFingerprintScope:
          values.requireFingerprintScope ??
          policy.attributes.requireFingerprintScope,
        requireComponentsScope:
          values.requireComponentsScope ??
          policy.attributes.requireComponentsScope,
        requireUserScope:
          values.requireUserScope ?? policy.attributes.requireUserScope,
        requireChecksumScope:
          values.requireChecksumScope ?? policy.attributes.requireChecksumScope,
        requireVersionScope:
          values.requireVersionScope ?? policy.attributes.requireVersionScope,

        machineUniquenessStrategy:
          values.machineUniquenessStrategy ??
          policy.attributes.machineUniquenessStrategy,
        machineMatchingStrategy:
          values.machineMatchingStrategy ??
          policy.attributes.machineMatchingStrategy,
        componentUniquenessStrategy:
          values.componentUniquenessStrategy ??
          policy.attributes.componentUniquenessStrategy,
        componentMatchingStrategy:
          values.componentMatchingStrategy ??
          policy.attributes.componentMatchingStrategy,
        overageStrategy:
          values.overageStrategy ?? policy.attributes.overageStrategy,

        requireHeartbeat:
          values.requireHeartbeat ?? policy.attributes.requireHeartbeat,
        heartbeatDuration: values.heartbeatDuration ?? null,
        heartbeatBasis:
          values.heartbeatBasis ?? policy.attributes.heartbeatBasis,
        heartbeatCullStrategy:
          values.heartbeatCullStrategy ??
          policy.attributes.heartbeatCullStrategy,
        heartbeatResurrectionStrategy:
          values.heartbeatResurrectionStrategy ??
          policy.attributes.heartbeatResurrectionStrategy,
        machineLeasingStrategy:
          values.machineLeasingStrategy ??
          policy.attributes.machineLeasingStrategy,
        processLeasingStrategy:
          values.processLeasingStrategy ??
          policy.attributes.processLeasingStrategy,

        authenticationStrategy:
          values.authenticationStrategy ??
          policy.attributes.authenticationStrategy,
        scheme: values.scheme ?? policy.attributes.scheme ?? null,
        encrypted: values.encrypted ?? policy.attributes.encrypted,
      },
      relationships: {
        ...policy.relationships,
        product: {
          ...policy.relationships.product,
          data: {
            type: "products",
            id: values.product?.id ?? policy.relationships.product?.data?.id!,
          },
        },
        entitlements: {
          ...policy.relationships.entitlements,
          data: (values.entitlements?.attach ?? []).map((eid) => ({
            type: "entitlements",
            id: eid,
          })),
        },
      },
    }

    MockPolicies.push(created)

    toast({ message: "Policy created", variant: "success" })

    navigate({
      to: "/$id/app/policies/$policyId",
      params: {
        id: keygen.config.id,
        policyId: created.id,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="min-h-screen min-w-screen rounded-none border-none"
      >
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
            Duplicating an existing policy
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>

        {policyLoading || policyFetching ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : policyError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load policy.
          </p>
        ) : (
          open && (
            <DuplicateForm
              policy={policy!}
              onSubmit={handleCreatePolicy}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
