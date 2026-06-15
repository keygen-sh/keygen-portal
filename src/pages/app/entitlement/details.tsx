import { useState, useEffect } from "react"
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
  Menu,
  GitFork,
  Copy,
  SquarePlus,
  SquarePen,
  EllipsisVertical,
} from "lucide-react"

import { useGetEntitlement, useRemoveEntitlement } from "@/queries/entitlements"
import { useMobile } from "@/hooks/use-mobile"
import { useSidebarTab } from "@/hooks/use-sidebar-tab"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as Entitlements from "@/components/entitlements"
import * as EventLogs from "@/components/event-logs"
import Can from "@/components/can"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import ConfirmationModal from "@/components/confirmation-modal"
import ResourceLink from "@/components/resource-link"
import CollapsibleCard from "@/components/collapsible-card"

export default function EntitlementDetails() {
  const { id } = useParams({
    from: "/$accountId/app/entitlements/$id",
  })
  const {
    data: entitlement,
    isLoading: entitlementLoading,
    isFetching: entitlementFetching,
    isError: entitlementError,
  } = useGetEntitlement(id)

  const deleteEntitlement = useRemoveEntitlement(id)

  const back = useBackNavigate()

  const isMobile = useMobile()
  const [tab, setTab] = useSidebarTab()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
  })

  useEffect(() => {
    ;(async () => {
      if (entitlementError && !entitlementFetching) {
        await back()
      }
    })()
  }, [entitlementError, entitlementFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteEntitlement = () => {
    if (!entitlement) return

    deleteEntitlement.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Entitlement deleted",
          variant: "success",
        })
        await back()
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
                  Entitlements
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {entitlement ? (
                  <BreadcrumbPage>{entitlement.attributes.name}</BreadcrumbPage>
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
                  disabled={entitlementLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                <Can permission="entitlement.update">
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("edit", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Edit
                  </DropdownMenuItem>
                  <Separator />
                </Can>
                <Can permission="entitlement.delete">
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("delete", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Delete
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Can permission="entitlement.update">
                <Button
                  variant="outline"
                  disabled={entitlementLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="entitlement.delete">
                <Button
                  variant="outline"
                  disabled={entitlementLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {entitlement ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {entitlement.attributes.name}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(entitlement.id)}
                  className="w-fit pb-0.5"
                >
                  {entitlement.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <Attribute.Field
                    variant="outline"
                    label="Code"
                    value={entitlement.attributes.code}
                  />
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <div className="grid gap-4">
                    <Attribute.Field
                      variant="text"
                      label="Environment"
                      value={
                        <ResourceLink
                          linkage={entitlement.relationships.environment?.data}
                          emptyLabel="Global"
                        />
                      }
                    />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={entitlement} />
                </CollapsibleCard>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4 p-4 md:px-10 md:py-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <div className="mb-8 flex items-center gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        )}
      </div>

      {!isMobile && (
        <Tabs value={tab} onValueChange={setTab}>
          <Sidebar className="w-64 shrink-0" side="right">
            <SidebarHeader className="min-h-[70px] justify-end p-0">
              <TabsSwitch
                options={[
                  { value: "overview", label: "Overview", icon: Menu },
                  { value: "events", label: "Events", icon: GitFork },
                ]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview">
                {entitlement ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(entitlement.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(entitlement.attributes.updated)),
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

              <TabsContent
                value="events"
                className="flex min-h-0 flex-1 flex-col p-0"
              >
                <EventLogs.Feed
                  compact
                  filters={{ resource: { type: "entitlement", id } }}
                />
              </TabsContent>
            </SidebarContent>
            <SidebarFooter className="p-4"></SidebarFooter>
          </Sidebar>
        </Tabs>
      )}

      <Entitlements.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${entitlement?.attributes.name}`}
        description="Are you sure you want to delete this entitlement?"
        open={open.delete}
        disabled={entitlementLoading}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteEntitlement}
        label="Delete"
        variant="destructive"
        confirmText={entitlement?.attributes.name || "delete entitlement"}
      />
    </section>
  )
}
