import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useComponentTableColumns } from "@/hooks/use-component-table-columns"

import { Component } from "@/types/components"
import { useListComponents } from "@/queries/components"

import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import * as Skeletons from "@/components/skeletons"
import * as Components from "@/components/components"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function ComponentsList() {
  const { data: components = [], isLoading: componentsLoading } =
    useListComponents()
  const columns = useComponentTableColumns()
  const navigateToResource = useResourceNavigate()

  const [open, setOpen] = useState(false)

  return (
    <section>
      <PageHeader title="Components">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={componentsLoading}>
              New Component
            </Button>
          </DialogTrigger>

          <Components.Create.Modal
            onSelectComponent={(component) =>
              navigateToResource(component, "component")
            }
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {componentsLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Component>
          data={components}
          columns={columns}
          hideOnMobile={[
            "relationships.machine",
            "relationships.license",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(component) => navigateToResource(component, "component")}
        />
      )}
    </section>
  )
}
