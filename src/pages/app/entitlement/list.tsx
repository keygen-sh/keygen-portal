import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useEntitlementTableColumns } from "@/hooks/use-entitlement-table-columns"

import { Entitlement } from "@/types/entitlements"

import { useListEntitlements } from "@/queries/entitlements"

import * as keygen from "@/keygen"
import * as Skeletons from "@/components/skeletons"
import * as Entitlements from "@/components/entitlements"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function EntitlementsList() {
  const { data: entitlements = [], isLoading: entitlementsLoading } =
    useListEntitlements()
  const columns = useEntitlementTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectEntitlement = async (entitlement: Entitlement | null) => {
    if (!entitlement) return

    await navigate({
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
              New Entitlement
            </Button>
          </DialogTrigger>

          <Entitlements.Create.Modal
            onSelectEntitlement={(entitlement) =>
              handleSelectEntitlement(entitlement)
            }
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {entitlementsLoading ? (
        <Skeletons.Table />
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
          onRowClick={(entitlement) => handleSelectEntitlement(entitlement)}
        />
      )}
    </section>
  )
}
