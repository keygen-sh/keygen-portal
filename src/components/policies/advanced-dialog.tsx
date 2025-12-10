import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

import { Text, CurlyBraces, Copy } from "lucide-react"

import { useGetPolicy } from "@/queries/policies"

import { copyToClipboard } from "@/lib/clipboard"

import * as Policies from "@/components/policies"
import CollapsibleCard from "@/components/collapsible-card"
import TabsSwitch from "@/components/tabs-switch"

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
    data: policy,
    isLoading: policyLoading,
    isFetching: policyFetching,
    isError: policyError,
  } = useGetPolicy(id)

  const [tab, setTab] = useState<"attributes" | "inspect">("attributes")

  useEffect(() => {
    if (policyError && !policyFetching) {
      onOpenChange(false)
    }
  }, [policyError, policyFetching, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden p-0 md:min-w-4xl">
        <DialogHeader className="flex items-start border-b border-accent p-4 pt-3">
          <DialogTitle className="text-base">Advanced</DialogTitle>
          {/* FIXME(cazden) Missing 'Description' warning for Dialog */}
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          {!policy || policyLoading ? (
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
                    label: "Inspect policy",
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
                    <Policies.AllAttributes policy={policy} />

                    <CollapsibleCard title="Metadata" contentClass="p-0">
                      <div className="min-h-0 w-full min-w-0 overflow-x-auto">
                        {policy.attributes.metadata &&
                        Object.keys(policy.attributes.metadata).length > 0 ? (
                          <div className="relative p-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                copyToClipboard(
                                  JSON.stringify(
                                    policy.attributes.metadata,
                                    null,
                                    2,
                                  ),
                                )
                              }
                              className="absolute top-3 right-3 z-10 h-7 w-7 bg-accent/60 md:bg-accent/0"
                            >
                              <Copy className="size-3.5" />
                            </Button>

                            {/* FIXME(cazden) Text should be scrollable along X and shouldn't wrap on smaller screens */}
                            <pre className="w-full max-w-full font-mono text-sm leading-snug break-words whitespace-pre-wrap">
                              {JSON.stringify(
                                policy.attributes.metadata,
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        ) : (
                          <p className="font-mono text-sm text-content-muted">
                            {"{ }"}
                          </p>
                        )}
                      </div>
                    </CollapsibleCard>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="inspect"
                className="flex min-h-0 min-w-0 flex-1 p-0"
              >
                <div className="relative m-2 min-h-0 min-w-0 flex-1 overflow-hidden rounded border border-accent">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(policy, null, 2))
                    }
                    className="absolute top-3 right-3 z-10 h-7 w-7 bg-accent/60 md:bg-accent/0"
                  >
                    <Copy className="size-3.5" />
                  </Button>

                  {/* FIXME(cazden) Text should be scrollable along X on smaller screens */}
                  <ScrollArea className="size-full">
                    <pre className="w-max min-w-full p-3 font-mono text-sm leading-snug whitespace-pre">
                      {JSON.stringify(policy, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
