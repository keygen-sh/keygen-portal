import { useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Text, CurlyBraces } from "lucide-react"

import { useGetWebhookEvent } from "@/queries/webhook-events"

import * as WebhookEvents from "@/components/webhook-events"
import TabsSwitch from "@/components/tabs-switch"
import InspectResource from "@/components/inspect-resource"

interface AdvancedDialogProps {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AdvancedDialog({
  id,
  open,
  onOpenChange,
}: AdvancedDialogProps) {
  const {
    data: webhookEvent,
    isLoading: webhookEventLoading,
    isFetching: webhookEventFetching,
    isError: webhookEventError,
  } = useGetWebhookEvent(id)

  const [tab, setTab] = useState<"attributes" | "inspect">("attributes")

  const hasError = webhookEventError && !webhookEventFetching

  return (
    <Dialog open={open && !hasError} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden p-0 md:min-w-4xl">
        <DialogHeader className="flex items-start border-b border-accent p-4 pt-3">
          <DialogTitle className="text-base">Advanced</DialogTitle>
          <DialogDescription className="sr-only">Advanced</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          {!webhookEvent || webhookEventLoading ? (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-32" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as typeof tab)}
              className="flex min-h-0 min-w-0 flex-1 flex-col gap-0"
            >
              <TabsSwitch
                className="pt-8 pb-0"
                options={[
                  {
                    value: "attributes",
                    label: "Other attributes",
                    icon: Text,
                  },
                  {
                    value: "inspect",
                    label: "Inspect event",
                    icon: CurlyBraces,
                  },
                ]}
              />
              <TabsContent
                value="attributes"
                className="flex min-h-0 min-w-0 flex-1 flex-col"
              >
                <ScrollArea className="min-h-0 w-full min-w-0">
                  <div className="flex min-w-0 flex-col gap-2 p-2">
                    <WebhookEvents.AllAttributes webhookEvent={webhookEvent} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="inspect"
                className="flex min-h-0 min-w-0 flex-1 p-0"
              >
                <InspectResource resource={webhookEvent} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
