import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { createTableColumnHelper } from "@/lib/tables"
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

  // TODO(ezekg) extract all this out into e.g. useEntitlementTableColumns so it can be used elsewhere?
  const column = createTableColumnHelper<Entitlement>()
  const columns = useMemo(
    () => [
      column.id({
        header: "ID",
        cell: (info) => <ClipboardButton value={info.getValue()} />,
      }),
      column.attr("name", {
        header: "Name",
      }),
      column.attr("code", {
        header: "Code",
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
