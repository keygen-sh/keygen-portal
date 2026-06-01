import { useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
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

import { Copy, Menu, SquarePen, SquarePlus } from "lucide-react"

import { EventLogAttributeDescriptions } from "@/types/event-logs"

import { useGetEventLog } from "@/queries/event-logs"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { copyToClipboard } from "@/lib/clipboard"
import { metadataDiffEntries, visibleMetadata } from "@/lib/event-logs"

import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import Diff from "@/components/diff"
import Metadata from "@/components/metadata"
import BackButton from "@/components/back-button"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import TooltipBadge from "@/components/tooltip-badge"
import ResourceLink from "@/components/resource-link"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"

export default function EventLogDetails() {
  const { id } = useParams({ from: "/$accountId/app/event-logs/$id" })
  const { data: eventLog, isFetching, isError } = useGetEventLog(id)
  const back = useBackNavigate()
  const isMobile = useMobile()

  useEffect(() => {
    ;(async () => {
      if (isError && !isFetching) {
        await back()
      }
    })()
  }, [isError, isFetching, back])

  const metadata = eventLog?.attributes.metadata ?? {}
  const diff = metadataDiffEntries(metadata)
  const displayMetadata = visibleMetadata(metadata)
  const environment = eventLog?.relationships.environment?.data
  const requestor = eventLog?.relationships.whodunnit?.data
  const resource = eventLog?.relationships.resource?.data

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
                  Event Logs
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {eventLog ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto">
                    {eventLog.attributes.event}
                  </BreadcrumbPage>
                ) : (
                  <Skeleton className="h-6 w-32" />
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageHeader>

        {eventLog ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col items-start gap-3">
                <TooltipBadge
                  value={eventLog.attributes.event}
                  variant="secondary"
                  tooltip={EventLogAttributeDescriptions.event}
                  className="px-1 font-mono text-xs"
                />
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(eventLog.id)}
                  className="w-fit pb-0.5"
                >
                  {eventLog.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Changes" contentClass="p-0">
                  <Diff entries={diff} />
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
                    <Attribute.Field
                      variant="text"
                      label="Requestor"
                      value={
                        <ResourceLink linkage={requestor} emptyLabel="System" />
                      }
                    />
                    <Attribute.Field
                      variant="text"
                      label="Resource"
                      value={<ResourceLink linkage={resource} />}
                    />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata
                    resource={{ attributes: { metadata: displayMetadata } }}
                  />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    {eventLog ? (
                      <CollapsibleMenu title="Properties" className="space-y-2">
                        <Attribute.Field
                          label="Created at"
                          value={formatDate(
                            new Date(String(eventLog.attributes.created)),
                            "PP",
                          )}
                        />
                        <Attribute.Field
                          label="Updated at"
                          value={formatDate(
                            new Date(String(eventLog.attributes.updated)),
                            "PP",
                          )}
                        />
                      </CollapsibleMenu>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    )}
                  </CollapsibleCard>
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
            <SidebarHeader className="p-0 pt-4">
              <TabsSwitch
                options={[{ value: "overview", label: "Overview", icon: Menu }]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview">
                {eventLog ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(eventLog.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(eventLog.attributes.updated)),
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
            <SidebarFooter className="p-4"></SidebarFooter>
          </Sidebar>
        </Tabs>
      )}
    </section>
  )
}
