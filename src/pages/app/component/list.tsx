import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import { useComponentTableColumns } from "@/hooks/use-component-table-columns"
import { Component, MockComponents } from "@/types/components"

import * as keygen from "@/keygen"
import * as Components from "@/components/components"
import * as Skeletons from "@/components/skeletons"
import DataTable from "@/components/data-table"
import PageHeader from "@/components/page-header"

export default function ComponentsList() {
  const [componentsLoading, setComponentsLoading] = useState(true)
  const columns = useComponentTableColumns()

  const navigate = useNavigate()

  const [open, setOpen] = useState(false)

  const handleSelectComponent = async (component: Component | null) => {
    if (!component) return

    await navigate({
      to: "/$id/app/components/$componentId",
      params: { id: keygen.config.id, componentId: component.id },
    })
  }

  useEffect(() => {
    setTimeout(() => {
      setComponentsLoading(false)
    }, 300)
  }, [])

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
            onSelectComponent={(component) => handleSelectComponent(component)}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      </PageHeader>

      {componentsLoading ? (
        <Skeletons.Table />
      ) : (
        <DataTable<Component>
          data={MockComponents}
          columns={columns}
          hideOnMobile={[
            "relationships.machine",
            "relationships.license",
            "attributes.created",
            "attributes.updated",
          ]}
          onRowClick={(c) => handleSelectComponent(c)}
        />
      )}
    </section>
  )
}
