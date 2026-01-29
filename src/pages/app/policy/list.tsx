import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { usePolicyTableColumns } from "@/hooks/use-policy-table-columns"

import { Policy } from "@/types/policies"

import { useListPolicies } from "@/queries/policies"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Policies from "@/components/policies"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function PoliciesList() {
  const { data: policies = [], isLoading: policiesLoading } = useListPolicies()
  const columns = usePolicyTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section>
      <PageHeader title="Policies">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={policiesLoading}>
              New Policy
            </Button>
          </DialogTrigger>

          <Policies.Create.Modal
            onSelectPolicy={(policy) => navigateToResource(policy, "policy")}
            open={open}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {policiesLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Policy>
          data={policies}
          columns={columns}
          hideOnMobile={[
            "attributes.id",
            "attributes.url",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(policy) => navigateToResource(policy, "policy")}
        />
      )}
    </section>
  )
}
