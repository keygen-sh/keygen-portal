import { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
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
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  Copy,
  Logs,
  Menu,
  GitFork,
  SquarePen,
  SquarePlus,
  EllipsisVertical,
} from "lucide-react"

import { GroupAttributeDescriptions } from "@/types/groups"

import { useGetGroup, useRemoveGroup } from "@/queries/groups"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as keygen from "@/keygen"
import * as Groups from "@/components/groups"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as EventLogs from "@/components/event-logs"
import Can from "@/components/can"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import GoToButton from "@/components/go-to-button"
import ConfirmationModal from "@/components/confirmation-modal"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"

export default function GroupDetails() {
  const { id } = useParams({ from: "/$accountId/app/groups/$id" })

  const {
    data: group,
    isLoading: groupLoading,
    isFetching: groupFetching,
    isError: groupError,
  } = useGetGroup(id)
  const removeGroup = useRemoveGroup(id)

  const back = useBackNavigate()

  const isMobile = useMobile()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    attributes: false,
  })

  useEffect(() => {
    ;(async () => {
      if (groupError && !groupFetching) {
        await back()
      }
    })()
  }, [groupError, groupFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteGroup = async () => {
    try {
      await removeGroup.mutateAsync()
      toast({ message: "Group deleted", variant: "success" })
      await back()
    } catch {
      toast({ message: "Failed to delete group", variant: "error" })
    }
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
                  Groups
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {group ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto">
                    {group?.attributes.name}
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
                  disabled={groupLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                <Can permission="group.update">
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
                <Can permission="group.delete">
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
              <Can permission="group.update">
                <Button
                  variant="outline"
                  disabled={groupLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="group.delete">
                <Button
                  variant="outline"
                  disabled={groupLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {group ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {group?.attributes.name}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(group.id)}
                  className="w-fit pb-0.5"
                >
                  {group.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Limits">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Max Users"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              group.attributes.maxUsers !== null
                                ? String(group.attributes.maxUsers)
                                : null
                            }
                            tooltip={GroupAttributeDescriptions.maxUsers}
                            emptyLabel="Unlimited"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Max Licenses"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              group.attributes.maxLicenses !== null
                                ? String(group.attributes.maxLicenses)
                                : null
                            }
                            tooltip={GroupAttributeDescriptions.maxLicenses}
                            emptyLabel="Unlimited"
                          />
                        }
                      />
                    </div>

                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Max Machines"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              group.attributes.maxMachines !== null
                                ? String(group.attributes.maxMachines)
                                : null
                            }
                            tooltip={GroupAttributeDescriptions.maxMachines}
                            emptyLabel="Unlimited"
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <Attribute.Field
                    variant="text"
                    label="Licenses"
                    value={
                      <GoToButton
                        path="/$accountId/app/licenses"
                        params={{ accountId: keygen.config.id }}
                        label="View all"
                      />
                    }
                  />
                  <Attribute.Field
                    variant="text"
                    label="Users"
                    value={
                      <GoToButton
                        path="/$accountId/app/users"
                        params={{ accountId: keygen.config.id }}
                        label="View all"
                      />
                    }
                  />
                  <Attribute.Field
                    variant="text"
                    label="Machines"
                    value={
                      <GoToButton
                        path="/$accountId/app/machines"
                        params={{ accountId: keygen.config.id }}
                        label="View all"
                      />
                    }
                  />
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={group} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    {group ? (
                      <CollapsibleMenu title="Properties" className="space-y-2">
                        <Attribute.Field
                          label="Created at"
                          value={formatDate(
                            new Date(String(group.attributes.created)),
                            "PP",
                          )}
                        />
                        <Attribute.Field
                          label="Updated at"
                          value={formatDate(
                            new Date(String(group.attributes.updated)),
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

                {isMobile && (
                  <CollapsibleCard title="Events">
                    <EventLogs.Feed
                      compact
                      filters={{ resource: { type: "groups", id } }}
                    />
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
        <Tabs defaultValue="overview">
          <Sidebar className="w-64 shrink-0" side="right">
            <SidebarHeader className="p-0 pt-4">
              <TabsSwitch
                options={[
                  { value: "overview", label: "Overview", icon: Menu },
                  { value: "events", label: "Events", icon: GitFork },
                ]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview">
                {group ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(group.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(group.attributes.updated)),
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
                  filters={{ resource: { type: "groups", id } }}
                />
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

      <Groups.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${group?.attributes.name}`}
        description="Are you sure you want to delete this group? This action cannot be undone."
        open={open.delete}
        disabled={groupLoading}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteGroup}
        label="Delete"
        variant="destructive"
        confirmText={group?.attributes.name || "delete group"}
      />

      {group && (
        <Groups.AdvancedDialog
          id={group.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
