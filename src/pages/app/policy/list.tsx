import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { usePolicyTableColumns } from "@/hooks/use-policy-table-columns"
import { Policy, MockPolicies } from "@/types/policies"

// import { useListPolicies } from "@/queries/policies"

import * as keygen from "@/keygen"
import * as Policies from "@/components/policies"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import SkeletonTable from "@/components/skeleton-table"

export default function PoliciesList() {
  // const { data: policies = [], isLoading: policiesLoading } = useListPolicies()
  const [policiesLoading, setPoliciesLoading] = useState(true)
  const columns = usePolicyTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectPolicy = (policy: Policy | null) => {
    if (!policy) return

    await navigate({
      to: "/$id/app/policies/$policyId",
      params: { id: keygen.config.id, policyId: policy.id },
    })
  }

  // Mock API call
  useEffect(() => {
    setTimeout(() => {
      setPoliciesLoading(false)
    }, 1000)
  }, [])

  return (
    <section>
      <PageHeader title="Policies">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={policiesLoading}>
              Create Policy
            </Button>
          </DialogTrigger>

          <Policies.Create.Modal
            onSelectPolicy={(policy) => handleSelectPolicy(policy)}
            open={open}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {policiesLoading ? (
        <SkeletonTable />
      ) : (
        <DataTable<Policy>
          data={MockPolicies}
          columns={columns}
          hideOnMobile={[
            "attributes.id",
            "attributes.url",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(p) => handleSelectPolicy(p)}
        />
      )}
    </section>
  )
}
