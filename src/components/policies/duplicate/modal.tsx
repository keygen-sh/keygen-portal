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
import {
  useGetPolicy,
  useCreatePolicy,
  useListPolicyEntitlements,
} from "@/queries/policies"
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
  const { id } = useParams({ from: "/$accountId/app/policies/$id" })
  const {
    data: policy,
    isLoading: policyLoading,
    isError: policyError,
  } = useGetPolicy(id)

  const { data: entitlements = [] } = useListPolicyEntitlements(id)

  const createPolicy = useCreatePolicy()
  const navigate = useNavigate()

  const handleCreatePolicy = (values: Forms.Policies.CreateValues) => {
    if (!policy) return

    createPolicy.mutate(values, {
      onSuccess: async (created) => {
        toast({ message: "Policy created", variant: "success" })
        onOpenChange(false)

        await navigate({
          to: "/$accountId/app/policies/$id",
          params: {
            accountId: keygen.config.id,
            id: created.id,
          },
        })
      },
      onError: () => {
        toast({ message: "Failed to create policy", variant: "error" })
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
            <DuplicateForm
              policy={policy}
              entitlementIds={entitlements.map((e) => e.id)}
              onCreate={handleCreatePolicy}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
