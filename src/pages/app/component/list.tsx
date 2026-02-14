import { useState } from "react"

import { Button } from "@/components/ui/button"

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
        <Button
          size="sm"
          disabled={componentsLoading}
          onClick={() => setOpen(true)}
        >
          New Component
        </Button>
      </PageHeader>

      <Components.Form.Create open={open} onOpenChange={setOpen} />

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
          onRowClick={(component) => navigateToResource(component)}
        />
      )}
    </section>
  )
}
