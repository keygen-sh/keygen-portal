import { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Badge } from "@/components/ui/badge"
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
  CircleCheck,
  CircleX,
  RotateCcw,
  EllipsisVertical,
} from "lucide-react"

import {
  ProcessAttributeDescriptions,
  ProcessStatus,
  ProcessStatusLabels,
  ProcessStatusVariants,
  ProcessStatusDescriptions,
} from "@/types/processes"

import { useGetMachine } from "@/queries/machines"
import { useGetProduct } from "@/queries/products"
import { useGetLicense } from "@/queries/licenses"
import { useGetProcess, useRemoveProcess } from "@/queries/processes"

import { useMobile } from "@/hooks/use-mobile"
import { useSidebarTab } from "@/hooks/use-sidebar-tab"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { truncateKey } from "@/lib/licenses"
import { copyToClipboard } from "@/lib/clipboard"

import * as keygen from "@/keygen"
import * as Processes from "@/components/processes"
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
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"

const ProcessStatusIcons: Record<ProcessStatus, React.ReactNode> = {
  [ProcessStatus.Alive]: <CircleCheck className="size-3" />,
  [ProcessStatus.Dead]: <CircleX className="size-3" />,
  [ProcessStatus.Resurrected]: <RotateCcw className="size-3" />,
}

export default function ProcessDetails() {
  const { id } = useParams({
    from: "/$accountId/app/processes/$id",
  })
  const {
    data: process,
    isLoading: processLoading,
    isFetching: processFetching,
    isError: processError,
  } = useGetProcess(id)
  const removeProcess = useRemoveProcess(id)

  const machineId = process?.relationships.machine?.data?.id || ""
  const {
    data: machine,
    isLoading: machineLoading,
    isError: machineError,
  } = useGetMachine(machineId)

  const licenseId = process?.relationships.license?.data?.id || ""
  const {
    data: license,
    isLoading: licenseLoading,
    isError: licenseError,
  } = useGetLicense(licenseId)

  const productId = process?.relationships.product?.data?.id || ""
  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
  } = useGetProduct(productId)

  const back = useBackNavigate()

  const isMobile = useMobile()
  const [tab, setTab] = useSidebarTab()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    attributes: false,
  })

  useEffect(() => {
    ;(async () => {
      if (processError && !processFetching) {
        await back()
      }
    })()
  }, [processError, processFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteProcess = async () => {
    try {
      await removeProcess.mutateAsync()
      toast({ message: "Process Deleteed", variant: "success" })
      await back()
    } catch {
      toast({ message: "Failed to Delete process", variant: "error" })
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
                  Processes
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {process ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto">
                    {process?.attributes.pid}
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
                  disabled={processLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                <Can permission="process.update">
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
                <Can permission="process.delete">
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
              <Can permission="process.update">
                <Button
                  variant="outline"
                  disabled={processLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="process.delete">
                <Button
                  variant="outline"
                  disabled={processLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {process ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {process?.attributes.pid}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(process.id)}
                  className="w-fit pb-0.5"
                >
                  {process.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Pid"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={process.attributes.pid}
                            tooltip={ProcessAttributeDescriptions.pid}
                          />
                        }
                      />
                    </div>

                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Status"
                        variant="none"
                        value={
                          <TooltipBadge
                            icon={ProcessStatusIcons[process.attributes.status]}
                            value={
                              ProcessStatusLabels[process.attributes.status]
                            }
                            variant={
                              ProcessStatusVariants[process.attributes.status]
                            }
                            tooltip={
                              ProcessStatusDescriptions[
                                process.attributes.status
                              ]
                            }
                            className="px-1 text-xs"
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Heartbeat">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Last Heartbeat"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="date"
                            value={process.attributes.lastHeartbeat}
                            tooltip={ProcessAttributeDescriptions.lastHeartbeat}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Next Heartbeat"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="date"
                            value={process.attributes.nextHeartbeat}
                            tooltip={ProcessAttributeDescriptions.nextHeartbeat}
                          />
                        }
                      />
                    </div>

                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Interval"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="number"
                            value={process.attributes.interval}
                            tooltip={ProcessAttributeDescriptions.interval}
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <Attribute.Field
                    variant="text"
                    label="Machine"
                    value={
                      machineError ? (
                        <Badge variant="destructive">ERROR</Badge>
                      ) : machineLoading ? (
                        <Skeleton className="h-5 w-32 rounded-sm" />
                      ) : machine ? (
                        <GoToButton
                          path="/$accountId/app/machines/$id"
                          params={{
                            accountId: keygen.config.id,
                            id: machine.id,
                          }}
                          label={
                            machine.attributes.name ||
                            machine.attributes.fingerprint
                          }
                        />
                      ) : (
                        <GoToButton
                          path="/$accountId/app/machines"
                          params={{ accountId: keygen.config.id }}
                          label="View all"
                        />
                      )
                    }
                  />

                  <Attribute.Field
                    variant="text"
                    label="License"
                    value={
                      licenseError ? (
                        <Badge variant="destructive">ERROR</Badge>
                      ) : licenseLoading ? (
                        <Skeleton className="h-5 w-32 rounded-sm" />
                      ) : license ? (
                        <GoToButton
                          path="/$accountId/app/licenses/$id"
                          params={{
                            accountId: keygen.config.id,
                            id: license.id,
                          }}
                          label={
                            license.attributes.name ||
                            truncateKey(license.attributes.key, {
                              maxLength: isMobile ? 24 : 64,
                            })
                          }
                        />
                      ) : (
                        <GoToButton
                          path="/$accountId/app/licenses"
                          params={{ accountId: keygen.config.id }}
                          label="View all"
                        />
                      )
                    }
                  />

                  <Attribute.Field
                    variant="text"
                    label="Product"
                    value={
                      productError ? (
                        <Badge variant="destructive">ERROR</Badge>
                      ) : productLoading ? (
                        <Skeleton className="h-5 w-32 rounded-sm" />
                      ) : product ? (
                        <GoToButton
                          path="/$accountId/app/products/$id"
                          params={{
                            accountId: keygen.config.id,
                            id: product.id,
                          }}
                          label={product.attributes.name}
                        />
                      ) : (
                        <GoToButton
                          path="/$accountId/app/products"
                          params={{ accountId: keygen.config.id }}
                          label="View all"
                        />
                      )
                    }
                  />
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={process} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    {process ? (
                      <CollapsibleMenu title="Properties" className="space-y-2">
                        <Attribute.Field
                          label="Created at"
                          value={formatDate(
                            new Date(String(process.attributes.created)),
                            "PP",
                          )}
                        />
                        <Attribute.Field
                          label="Updated at"
                          value={formatDate(
                            new Date(String(process.attributes.updated)),
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
                      filters={{ resource: { type: "processes", id } }}
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
        <Tabs value={tab} onValueChange={setTab}>
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
                {process ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(process.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(process.attributes.updated)),
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
                  filters={{ resource: { type: "processes", id } }}
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

      <Processes.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${process?.attributes.pid}`}
        description="Are you sure you want to delete this process? This action cannot be undone."
        open={open.delete}
        disabled={processLoading}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteProcess}
        label="Delete"
        variant="destructive"
        confirmText="delete process"
      />

      {process && (
        <Processes.AdvancedDialog
          id={process.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
