import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { createResourceColumnHelper } from "@/lib/tables"
import { Policy, MockPolicies } from "@/types/policies"

// import { useListPolicies } from "@/queries/policies"
import { useListProducts } from "@/queries/products"

import * as keygen from "@/keygen"
import * as Policies from "@/components/policies"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import SkeletonTable from "@/components/skeleton-table"
import ClipboardButton from "@/components/clipboard-button"

export default function PoliciesList() {
  // const { data: policies = [], isLoading: policiesLoading } = useListPolicies()
  const [policiesLoading, setPoliciesLoading] = useState(true)
  const { data: products = [], isLoading: productsLoading } = useListProducts()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const productNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const product of products) map.set(product.id, product.attributes.name)
    return map
  }, [products])

  const column = createResourceColumnHelper<Policy>()
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
      }),
      column.rel("product", {
        sortingFn: "alphanumeric",
        header: "Product",
        cell: (info) => {
          const productId = info.getValue()?.data?.id ?? ""

          return productNameById.get(productId) ?? (
            <span className="text-muted-foreground">--</span>
          )
        },
      }),
      column.attr("created", {
        sortingFn: "datetime",
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      column.attr("updated", {
        sortingFn: "datetime",
        header: "Updated",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    [productNameById],
  )

  const handleSelectPolicy = (policy: Policy | null) => {
    if (!policy) return

    navigate({
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
            <Button size="sm" disabled={policiesLoading || productsLoading}>
              Create Policy
            </Button>
          </DialogTrigger>

          <Policies.Create.Modal
            onSelectPolicy={(policy) => handleSelectPolicy(policy!)}
            open={open}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {policiesLoading || productsLoading ? (
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
