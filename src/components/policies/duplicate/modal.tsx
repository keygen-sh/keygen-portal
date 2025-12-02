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

import * as Forms from "@/forms"
import { MockPolicies, Policy } from "@/types/policies"
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

  const handleCreatePolicy = async (payload: Forms.Policies.CreatePayload) => {
    if (!policy) return

    const entitlementIds = payload.entitlements?.attach ?? []

    onOpenChange(false)

    const now = new Date().toISOString()
    const newId = crypto.randomUUID()

    const created: Policy = {
      ...policy,
      id: newId,
      links: { self: `/v1/accounts/{ACCOUNT}/policies/${newId}` },
      attributes: {
        ...policy.attributes,
        name: payload.name ?? "",
        created: now,
        updated: now,
        metadata: payload.metadata ?? policy.attributes.metadata ?? {},
        duration: payload.duration ?? null,
        expirationStrategy:
          payload.expirationStrategy ?? policy.attributes.expirationStrategy,
        expirationBasis:
          payload.expirationBasis ?? policy.attributes.expirationBasis,
        renewalBasis: payload.renewalBasis ?? policy.attributes.renewalBasis,
        transferStrategy:
          payload.transferStrategy ?? policy.attributes.transferStrategy,
        strict: payload.strict ?? policy.attributes.strict,
        floating: payload.floating ?? policy.attributes.floating,
        protected: payload.protected ?? policy.attributes.protected,
        usePool: payload.usePool ?? policy.attributes.usePool,
        checkInInterval: payload.checkInInterval ?? null,
        checkInIntervalCount: payload.checkInIntervalCount ?? null,
        maxMachines: payload.maxMachines ?? null,
        maxProcesses: payload.maxProcesses ?? null,
        maxUsers: payload.maxUsers ?? null,
        maxUses: payload.maxUses ?? null,
        maxCores: payload.maxCores ?? null,
        requireCheckIn:
          payload.requireCheckIn ?? policy.attributes.requireCheckIn,
        requireProductScope:
          payload.requireProductScope ?? policy.attributes.requireProductScope,
        requirePolicyScope:
          payload.requirePolicyScope ?? policy.attributes.requirePolicyScope,
        requireMachineScope:
          payload.requireMachineScope ?? policy.attributes.requireMachineScope,
        requireFingerprintScope:
          payload.requireFingerprintScope ??
          policy.attributes.requireFingerprintScope,
        requireComponentsScope:
          payload.requireComponentsScope ??
          policy.attributes.requireComponentsScope,
        requireUserScope:
          payload.requireUserScope ?? policy.attributes.requireUserScope,
        requireChecksumScope:
          payload.requireChecksumScope ??
          policy.attributes.requireChecksumScope,
        requireVersionScope:
          payload.requireVersionScope ?? policy.attributes.requireVersionScope,

        machineUniquenessStrategy:
          payload.machineUniquenessStrategy ??
          policy.attributes.machineUniquenessStrategy,
        machineMatchingStrategy:
          payload.machineMatchingStrategy ??
          policy.attributes.machineMatchingStrategy,
        componentUniquenessStrategy:
          payload.componentUniquenessStrategy ??
          policy.attributes.componentUniquenessStrategy,
        componentMatchingStrategy:
          payload.componentMatchingStrategy ??
          policy.attributes.componentMatchingStrategy,
        overageStrategy:
          payload.overageStrategy ?? policy.attributes.overageStrategy,

        requireHeartbeat:
          payload.requireHeartbeat ?? policy.attributes.requireHeartbeat,
        heartbeatDuration: payload.heartbeatDuration ?? null,
        heartbeatBasis:
          payload.heartbeatBasis ?? policy.attributes.heartbeatBasis,
        heartbeatCullStrategy:
          payload.heartbeatCullStrategy ??
          policy.attributes.heartbeatCullStrategy,
        heartbeatResurrectionStrategy:
          payload.heartbeatResurrectionStrategy ??
          policy.attributes.heartbeatResurrectionStrategy,
        machineLeasingStrategy:
          payload.machineLeasingStrategy ??
          policy.attributes.machineLeasingStrategy,
        processLeasingStrategy:
          payload.processLeasingStrategy ??
          policy.attributes.processLeasingStrategy,

        authenticationStrategy:
          payload.authenticationStrategy ??
          policy.attributes.authenticationStrategy,
        scheme: payload.scheme ?? policy.attributes.scheme ?? null,
        encrypted: payload.encrypted ?? policy.attributes.encrypted,
      },
      relationships: {
        ...policy.relationships,
        product: {
          ...policy.relationships.product,
          data: {
            type: "products",
            id: payload.product?.id ?? policy.relationships.product?.data?.id,
          },
        },
        entitlements: {
          ...policy.relationships.entitlements,
          data: entitlementIds.map((eid) => ({
            type: "entitlements",
            id: eid,
          })),
        },
      },
    }

    MockPolicies.push(created)

    toast({ message: "Policy created", variant: "success" })

    await navigate({
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
              onCreate={handleCreatePolicy}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
