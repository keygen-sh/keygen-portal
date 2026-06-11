import { useEffect, useState } from "react"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
  Copy,
  Logs,
  Menu,
  SquarePen,
  SquarePlus,
  EllipsisVertical,
} from "lucide-react"

import { useGetEvent, useRemoveEvent, useRetryEvent } from "@/queries/events"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"
import { useResourceNavigate } from "@/hooks/use-resource-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"
import { formatEventPayload } from "@/lib/events"

import {
  EventStatusLabels,
  EventStatusVariants,
  EventStatusDescriptions,
  EventAttributeDescriptions,
} from "@/types/events"

import * as Events from "@/components/events"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import Can from "@/components/can"
import Code from "@/components/code"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import TooltipBadge from "@/components/tooltip-badge"
import ResourceLink from "@/components/resource-link"
import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"
import ConfirmationModal from "@/components/confirmation-modal"

export default function EventDetails() {
  const { id } = useParams({ from: "/$accountId/app/webhook-events/$id" })
  const { data: event, isLoading, isFetching, isError } = useGetEvent(id)
  const removeEvent = useRemoveEvent(id)
  const retryEvent = useRetryEvent(id)

  const environment = event?.relationships.environment?.data

  const back = useBackNavigate()
  const navigateToResource = useResourceNavigate()
  const isMobile = useMobile()
  const [open, setOpen] = useState({ delete: false, attributes: false })

  useEffect(() => {
    ;(async () => {
      if (isError && !isFetching) {
        await back()
      }
    })()
  }, [isError, isFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDelete = () => {
    removeEvent.mutate(undefined, {
      onSuccess: async () => {
        toast({ message: "Webhook event deleted", variant: "success" })
        await back()
      },
    })
  }

  const handleRetry = () => {
    retryEvent.mutate(undefined, {
      onSuccess: async (retriedEvent) => {
        toast({
          message: "Webhook event queued for redelivery",
          variant: "success",
        })
        await navigateToResource(retriedEvent)
      },
      onError: () => {
        toast({ message: "Failed to retry webhook event", variant: "error" })
      },
    })
  }

  return (
    <section className="flex h-screen w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <PageHeader>
          <Breadcrumb className="flex-1">
            <BreadcrumbList className="text-base">
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => back()}
                >
                  Webhook Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {event ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto md:max-w-md">
                    {event.attributes.endpoint}
                  </BreadcrumbPage>
                ) : (
                  <Skeleton className="h-6 w-32" />
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={isLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                <Can permission="webhook-event.retry">
                  <DropdownMenuItem
                    disabled={retryEvent.isPending}
                    onClick={(e) => {
                      handleRetry()
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Retry
                  </DropdownMenuItem>
                  <Separator />
                </Can>
                <Can permission="webhook-event.delete">
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("delete", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Can permission="webhook-event.retry">
                <Button
                  variant="outline"
                  disabled={isLoading || retryEvent.isPending}
                  onClick={handleRetry}
                >
                  Retry
                </Button>
              </Can>
              <Can permission="webhook-event.delete">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {event ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="mb-2 flex flex-wrap gap-2">
                <TooltipBadge
                  value={event.attributes.event}
                  variant="secondary"
                  tooltip={EventAttributeDescriptions.event}
                  className="gap-0 px-1 font-mono text-xs hover:gap-1"
                />
                <TooltipBadge
                  value={EventStatusLabels[event.attributes.status]}
                  variant={EventStatusVariants[event.attributes.status]}
                  tooltip={EventStatusDescriptions[event.attributes.status]}
                  className="gap-0 px-1 font-mono text-xs hover:gap-1"
                />
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {event.attributes.endpoint}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(event.id)}
                  className="w-fit"
                >
                  {event.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
                    <div className="space-y-4 md:pr-3">
                      <Attribute.Field
                        label="API version"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={event.attributes.apiVersion}
                            tooltip={EventAttributeDescriptions.apiVersion}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Last response code"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="number"
                            value={event.attributes.lastResponseCode}
                            tooltip={
                              EventAttributeDescriptions.lastResponseCode
                            }
                            emptyLabel="N/A"
                          />
                        }
                      />
                    </div>
                    <div className="mt-4 space-y-4 md:mt-0 md:pl-3">
                      <Attribute.Field
                        label="Last response body"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={event.attributes.lastResponseBody}
                            tooltip={
                              EventAttributeDescriptions.lastResponseBody
                            }
                            emptyLabel="--"
                            className="break-all"
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Payload" contentClass="p-0">
                  <Code value={formatEventPayload(event.attributes.payload)} />
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <div className="grid gap-4">
                    <Attribute.Field
                      variant="text"
                      label="Environment"
                      value={
                        <ResourceLink
                          linkage={environment}
                          emptyLabel="Global"
                        />
                      }
                    />
                  </div>
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    <CollapsibleMenu title="Properties" className="space-y-2">
                      <Attribute.Field
                        label="Created at"
                        value={formatDate(
                          new Date(String(event.attributes.created)),
                          "PP",
                        )}
                      />
                      <Attribute.Field
                        label="Updated at"
                        value={formatDate(
                          new Date(String(event.attributes.updated)),
                          "PP",
                        )}
                      />
                    </CollapsibleMenu>
                  </CollapsibleCard>
                )}

                {isMobile && (
                  <Button
                    variant="outline"
                    onClick={() => toggleOpen("attributes", true)}
                    className="w-full text-content-muted"
                  >
                    <Logs className="mt-0.5 size-4 text-content-normal" />
                    View All Attributes
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4 p-4 md:px-10 md:py-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        )}
      </div>

      {!isMobile && (
        <Tabs defaultValue="overview">
          <Sidebar className="w-64 shrink-0" side="right">
            <SidebarHeader className="min-h-[70px] justify-end p-0">
              <TabsSwitch
                options={[{ value: "overview", label: "Overview", icon: Menu }]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview">
                {event ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(event.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(event.attributes.updated)),
                          "PP",
                        )}
                      />
                    </Property.Section>

                    <Separator />
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                )}
              </TabsContent>
            </SidebarContent>
            <SidebarFooter className="p-4">
              <Button
                variant="outline"
                onClick={() => toggleOpen("attributes", true)}
                className="w-full text-content-muted"
              >
                <Logs className="mt-0.5 size-4 text-content-normal" />
                View All Attributes
              </Button>
            </SidebarFooter>
          </Sidebar>
        </Tabs>
      )}

      <ConfirmationModal
        title="Delete webhook event"
        description="Are you sure you want to delete this webhook event? This action cannot be undone."
        open={open.delete}
        disabled={isLoading || removeEvent.isPending}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDelete}
        label="Delete"
        variant="destructive"
      />

      <Events.AdvancedDialog
        id={id}
        open={open.attributes}
        onOpenChange={(value) => toggleOpen("attributes", value)}
      />
    </section>
  )
}
