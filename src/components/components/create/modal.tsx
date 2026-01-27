import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import * as Forms from "@/forms"
import { Component } from "@/types/components"

import { useCreateComponent } from "@/queries/components"

import { toast } from "@/lib/toast"

import * as Loading from "@/components/loading"
import * as Components from "@/components/components"
import DocumentationLink from "@/components/documentation-link"

interface ComponentsCreateModalProps {
  onSelectComponent: (component: Component | null) => void
  onClose: () => void
}

export default function ComponentsCreateModal({
  onSelectComponent,
  onClose,
}: ComponentsCreateModalProps) {
  const createComponent = useCreateComponent()

  const form = useForm<Forms.Components.CreateValues>({
    resolver: zodResolver(Forms.Components.CreateSchema),
    mode: "onChange",
    defaultValues: {
      fingerprint: "",
      name: "",
      metadata: {},
      machineId: "",
    },
  })

  const handleCreateComponent = useCallback(
    (values: Forms.Components.CreateValues) => {
      createComponent.mutate(values, {
        onSuccess: (component) => {
          toast({ message: "Component created", variant: "success" })
          onSelectComponent(component)
          onClose()
        },
        onError: (error) => {
          toast({
            message: "Failed to create component",
            description: error.detail,
            variant: "error",
          })
        },
      })
    },
    [createComponent, onSelectComponent, onClose],
  )

  return (
    <DialogContent className="min-w-fit">
      <DialogHeader className="h-fit items-start border-b border-accent p-4">
        <DialogDescription className="text-xs">
          Creating a new component
        </DialogDescription>
        <DialogTitle className="sr-only">New Component</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateComponent)}>
          <ScrollArea className="h-[calc(100vh-11rem)] md:h-[50vh] md:w-4xl">
            <Components.Fields.All layout="create" />

            <DocumentationLink page="components" />
          </ScrollArea>

          <DialogFooter className="flex flex-row gap-4 border-t border-accent p-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={createComponent.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={createComponent.isPending}
              className="max-w-48 flex-1 basis-1/2"
            >
              {createComponent.isPending ? (
                <Loading.Dots className="bg-background" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
