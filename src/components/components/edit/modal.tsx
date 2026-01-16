import { useCallback, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"
import { Component, MockComponents } from "@/types/components"

import EditForm from "./edit-form"

import * as Loading from "@/components/loading"

interface ComponentsEditModalProps {
  open: boolean
  onClose: () => void
  component: Component | null
}

export default function ComponentsEditModal({
  open,
  onClose,
  component,
}: ComponentsEditModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpdateComponent = useCallback(
    (values: Forms.Components.UpdateValues) => {
      if (!component) return

      setLoading(true)

      const index = MockComponents.findIndex((c) => c.id === component.id)
      if (index === -1) {
        toast({ message: "Component not found", variant: "error" })
        setLoading(false)
        return
      }

      const updated: Component = {
        ...component,
        attributes: {
          ...component.attributes,
          name:
            values.name !== undefined ? values.name : component.attributes.name,
          metadata: values.metadata ?? component.attributes.metadata,
          updated: new Date().toISOString(),
        },
      }

      MockComponents[index] = updated
      setLoading(false)
      toast({ message: "Component updated", variant: "success" })
      onClose()
    },
    [component, onClose],
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="min-h-screen min-w-screen rounded-none border-none"
      >
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-8 items-center space-x-1 text-xs">
            Updating an existing component
          </DialogDescription>
          <DialogTitle className="sr-only" />
        </DialogHeader>
        {!component ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : (
          open && (
            <EditForm
              component={component}
              loading={loading}
              onUpdate={handleUpdateComponent}
              onCancel={onClose}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
