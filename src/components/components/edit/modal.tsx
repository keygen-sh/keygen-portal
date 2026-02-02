import { useParams } from "@tanstack/react-router"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { toast } from "@/lib/toast"

import * as Forms from "@/forms"

import { useGetComponent, useUpdateComponent } from "@/queries/components"

import EditForm from "./edit-form"
import * as Loading from "@/components/loading"

interface ComponentsEditModalProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export default function ComponentsEditModal({
  open,
  onOpenChange,
}: ComponentsEditModalProps) {
  const { id } = useParams({
    from: "/$accountId/app/components/$id",
  })
  const {
    data: component,
    isLoading: componentLoading,
    isError: componentError,
  } = useGetComponent(id)
  const updateComponent = useUpdateComponent(id)

  const handleUpdateComponent = (values: Forms.Components.UpdateValues) => {
    if (!component) return
    updateComponent.mutate(values, {
      onSuccess: () => {
        toast({ message: "Component updated", variant: "success" })
        onOpenChange(false)
      },
      onError: () =>
        toast({ message: "Failed to update component", variant: "error" }),
      onSettled() {
        if (!updateComponent.isError) {
          onOpenChange(false)
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        {componentLoading ? (
          <div className="flex w-full justify-center">
            <Loading.Dots />
          </div>
        ) : componentError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load component.
          </p>
        ) : (
          open &&
          component && (
            <EditForm
              component={component}
              loading={updateComponent.isPending}
              onUpdate={handleUpdateComponent}
              onCancel={() => onOpenChange(false)}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
