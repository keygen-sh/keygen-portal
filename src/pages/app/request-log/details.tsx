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

import { useGetRequestLog } from "@/queries/request-logs"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import {
  formatRequestLogRequest,
  formatRequestLogResponse,
  requestLogStatusBadgeVariant,
  requestLogMethodBadgeVariant,
} from "@/lib/request-logs"
import { copyToClipboard } from "@/lib/clipboard"

import { HTTPStatusCodeDescriptions, type HTTPStatusCode } from "@/types/http"

import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import Code from "@/components/code"
import BackButton from "@/components/back-button"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import TooltipBadge from "@/components/tooltip-badge"
import ResourceLink from "@/components/resource-link"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"

export default function RequestLogDetails() {
  const { id } = useParams({ from: "/$accountId/app/request-logs/$id" })
  const { data: requestLog, isFetching, isError } = useGetRequestLog(id)
  const back = useBackNavigate()
  const isMobile = useMobile()

  useEffect(() => {
    ;(async () => {
      if (isError && !isFetching) {
        await back()
      }
    })()
  }, [isError, isFetching, back])

  const environment = requestLog?.relationships.environment?.data
  const requestor = requestLog?.relationships.requestor?.data
  const resource = requestLog?.relationships.resource?.data

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
                  Request Logs
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {requestLog ? (
                  <BreadcrumbPage className="max-w-60 truncate md:max-w-2xl">
                    <span className="font-mono">
                      {requestLog.attributes.method} {requestLog.attributes.url}
                    </span>
                  </BreadcrumbPage>
                ) : (
                  <Skeleton className="h-6 w-32" />
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageHeader>

        {requestLog ? (
          <ScrollArea className="min-h-0 flex-1" orientation="both">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col items-start gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <TooltipBadge
                    value={requestLog.attributes.method}
                    variant={requestLogMethodBadgeVariant(
                      requestLog.attributes.method,
                    )}
                    tooltip="The HTTP method of the request."
                    className="gap-0 px-1 font-mono text-xs hover:gap-1"
                  />
                  <TooltipBadge
                    value={requestLog.attributes.status}
                    variant={requestLogStatusBadgeVariant(
                      requestLog.attributes.status,
                    )}
                    tooltip={
                      HTTPStatusCodeDescriptions[
                        requestLog.attributes.status as HTTPStatusCode
                      ] ?? "The HTTP response status code."
                    }
                    className="gap-0 px-1 font-mono text-xs hover:gap-1"
                  />
                </div>

                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(requestLog.id)}
                  className="w-fit"
                >
                  {requestLog.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Request" contentClass="p-0">
                  <Code
                    value={formatRequestLogRequest(requestLog.attributes)}
                  />
                </CollapsibleCard>

                <CollapsibleCard title="Response" contentClass="p-0">
                  <Code
                    value={formatRequestLogResponse(requestLog.attributes)}
                  />
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
                      value={<ResourceLink linkage={requestor} />}
                    />
                    <Attribute.Field
                      variant="text"
                      label="Resource"
                      value={<ResourceLink linkage={resource} />}
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
                          new Date(String(requestLog.attributes.created)),
                          "PP",
                        )}
                      />
                      <Attribute.Field
                        label="Updated at"
                        value={formatDate(
                          new Date(String(requestLog.attributes.updated)),
                          "PP",
                        )}
                      />
                    </CollapsibleMenu>
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
            <SidebarHeader className="min-h-[70px] justify-end p-0">
              <TabsSwitch
                options={[{ value: "overview", label: "Overview", icon: Menu }]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview">
                {requestLog ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(requestLog.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(requestLog.attributes.updated)),
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
