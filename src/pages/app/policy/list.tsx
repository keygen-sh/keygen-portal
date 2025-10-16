import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { Policy } from "@/types/policies"
import { MockPolicies } from "@/mock/policies"

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

  const column = createColumnHelper<Policy>()
  const columns = useMemo<ColumnDef<Policy, any>[]>(
    () => [
      column.accessor((row) => row.id, {
        id: "attributes.id",
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.accessor((row) => row.attributes.name, {
        header: "Name",
        id: "attributes.name",
      }),
      column.accessor(
        (row) => {
          const productId = row.relationships.product?.data?.id ?? ""
          return productNameById.get(productId) ?? ""
        },
        {
          id: "relationships.product",
          header: "Product",
          cell: (info) =>
            info.getValue() || (
              <span className="text-muted-foreground">--</span>
            ),
          sortingFn: "alphanumeric",
        },
      ),
      column.accessor((row) => row.attributes.created, {
        id: "attributes.created",
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      }),
      column.accessor((row) => row.attributes.updated, {
        id: "attributes.updated",
        header: "Updated",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
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
