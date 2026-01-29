import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useEntitlementTableColumns } from "@/hooks/use-entitlement-table-columns"

import { Entitlement } from "@/types/entitlements"

import { useListEntitlements } from "@/queries/entitlements"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Skeletons from "@/components/skeletons"
import * as Entitlements from "@/components/entitlements"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function EntitlementsList() {
  const { data: entitlements = [], isLoading: entitlementsLoading } =
    useListEntitlements()
  const columns = useEntitlementTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

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
              navigateToResource(entitlement, "entitlement")
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
          onRowClick={(entitlement) =>
            navigateToResource(entitlement, "entitlement")
          }
        />
      )}
    </section>
  )
}
