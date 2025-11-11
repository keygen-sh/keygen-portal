import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { Entitlement } from "@/types/entitlements"

import { useListEntitlements } from "@/queries/entitlements"

import * as keygen from "@/keygen"
import * as Entitlements from "@/components/entitlements"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"
import SkeletonTable from "@/components/skeleton-table"
import ClipboardButton from "@/components/clipboard-button"

export default function PoliciesList() {
  const { data: entitlements = [], isLoading: entitlementsLoading } =
    useListEntitlements()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const column = createColumnHelper<Entitlement>()
  const columns = useMemo<ColumnDef<Entitlement, any>[]>(
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
      column.accessor((row) => row.attributes.code, {
        header: "Code",
        id: "attributes.code",
      }),
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
    [],
  )

  const handleSelectEntitlement = (entitlement: Entitlement | null) => {
    if (!entitlement) return

    navigate({
      to: "/$id/app/entitlements/$entitlementId",
      params: { id: keygen.config.id, entitlementId: entitlement.id },
    })
  }

  return (
    <section>
      <PageHeader title="Entitlements">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={entitlementsLoading}>
              Create Entitlement
            </Button>
          </DialogTrigger>

          <Entitlements.Create.Modal
            onSelectEntitlement={(entitlement) =>
              handleSelectEntitlement(entitlement!)
            }
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {entitlementsLoading ? (
        <SkeletonTable />
      ) : (
        <DataTable<Entitlement>
          data={entitlements}
          columns={columns}
          hideOnMobile={[
            "attributes.id",
            "attributes.code",
            "attributes.url",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(p) => handleSelectEntitlement(p)}
        />
      )}
    </section>
  )
}
