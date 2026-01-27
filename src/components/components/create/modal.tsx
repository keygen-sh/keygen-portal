import { useCallback, useState } from "react"
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
import { Component, MockComponents } from "@/types/components"

import { useListMachines } from "@/queries/machines"

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
  const [loading, setLoading] = useState(false)
  const { data: machines = [] } = useListMachines()

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
      if (!values.machineId) {
        toast({
          message: "Failed to create component",
          description: "Machine is required.",
          variant: "error",
        })
        return
      }

      const machine = machines.find((m) => m.id === values.machineId)
      const licenseId = machine?.relationships?.license?.data?.id
      const productId = machine?.relationships?.product?.data?.id

      setLoading(true)

      const newComponent: Component = {
        id: crypto.randomUUID(),
        type: "components",
        links: {
          self: `/v1/accounts/{ACCOUNT}/components/${crypto.randomUUID()}`,
        },
        attributes: {
          fingerprint: values.fingerprint,
          name: values.name ?? null,
          metadata: values.metadata ?? {},
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        relationships: {
          account: {
            links: { related: "/v1/accounts/{ACCOUNT}" },
            data: { type: "accounts", id: "{ACCOUNT}" },
          },
          environment: {
            links: { related: null },
            data: null,
          },
          product: {
            links: { related: null },
            data: productId ? { type: "products", id: productId } : undefined,
          },
          license: {
            links: { related: null },
            data: licenseId ? { type: "licenses", id: licenseId } : undefined,
          },
          machine: {
            links: { related: null },
            data: { type: "machines", id: values.machineId },
          },
        },
      }

      MockComponents.push(newComponent)
      setLoading(false)
      toast({ message: "Component created", variant: "success" })
      onSelectComponent(newComponent)
      onClose()
    },
    [machines, onSelectComponent, onClose],
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
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="max-w-48 flex-1 basis-1/2"
            >
              {loading ? <Loading.Dots className="bg-background" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
