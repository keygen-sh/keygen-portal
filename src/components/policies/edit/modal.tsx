import { useCallback } from "react"
import { useParams } from "@tanstack/react-router"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import {
  useGetPolicy,
  useUpdatePolicy,
  useListPolicyEntitlements,
  useAttachPolicyEntitlements,
  useDetachPolicyEntitlements,
} from "@/queries/policies"

import * as Forms from "@/forms"

import EditForm from "./edit-form"

import * as Loading from "@/components/loading"

interface PoliciesEditModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export default function PoliciesEditModal({
  open,
  onOpenChange,
}: PoliciesEditModalProps) {
  const { policyId } = useParams({ from: "/$id/app/policies/$policyId" })
  const {
    data: policy,
    isLoading: policyLoading,
    isError: policyError,
  } = useGetPolicy(policyId)

  const { data: currentEntitlements = [] } = useListPolicyEntitlements(
    policy?.id ?? "",
  )

  const updatePolicy = useUpdatePolicy(policy?.id ?? "")
  const attachEntitlements = useAttachPolicyEntitlements(policy?.id ?? "")
  const detachEntitlements = useDetachPolicyEntitlements(policy?.id ?? "")

  const handleUpdatePolicy = useCallback(
    async (values: Forms.Policies.UpdateValues) => {
      if (!policy) return

      const currentIds = currentEntitlements.map((e) => e.id)
      const newIds = values.entitlements?.attach ?? []

      const toAttach = newIds.filter((id) => !currentIds.includes(id))
      const toDetach = currentIds.filter((id) => !newIds.includes(id))

      try {
        if (toDetach.length > 0) {
          await detachEntitlements.mutateAsync(toDetach)
        }

        if (toAttach.length > 0) {
          await attachEntitlements.mutateAsync(toAttach)
        }

        updatePolicy.mutate(values, {
          onSuccess: () => {
            toast({ message: "Policy updated", variant: "success" })
            onOpenChange(false)
          },
          onError: () =>
            toast({ message: "Failed to update policy", variant: "error" }),
        })
      } catch {
        toast({ message: "Failed to update entitlements", variant: "error" })
      }
    },
    [
      policy,
      onOpenChange,
      updatePolicy,
      currentEntitlements,
      attachEntitlements,
      detachEntitlements,
    ],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="min-h-screen min-w-screen rounded-none border-none"
      >
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
            Updating an existing policy
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {policyLoading ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : policyError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load policy.
          </p>
        ) : (
          open &&
          policy && (
            <EditForm
              policy={policy}
              entitlementIds={currentEntitlements.map((e) => e.id)}
              onUpdate={handleUpdatePolicy}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
