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
  EllipsisVertical,
} from "lucide-react"

import { MachineAttributeDescriptions } from "@/types/machines"

import {
  useGetMachine,
  useRemoveMachine,
  useResetMachineHeartbeat,
} from "@/queries/machines"
import { useGetUser } from "@/queries/users"
import { useGetGroup } from "@/queries/groups"
import { useGetProduct } from "@/queries/products"
import { useGetLicense } from "@/queries/licenses"

import { useMobile } from "@/hooks/use-mobile"
import { useSidebarTab } from "@/hooks/use-sidebar-tab"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { getUserLabel } from "@/lib/users"
import { copyToClipboard } from "@/lib/clipboard"
import { getHeartbeatStatusVariant } from "@/lib/machines"
import { truncateKey, formatTtlLabel } from "@/lib/licenses"

import * as keygen from "@/keygen"
import * as Machines from "@/components/machines"
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

export default function MachineDetails() {
  const { id } = useParams({ from: "/$accountId/app/machines/$id" })
  const {
    data: machine,
    isLoading: machineLoading,
    isFetching: machineFetching,
    isError: machineError,
  } = useGetMachine(id)
  const removeMachine = useRemoveMachine(id)
  const resetHeartbeat = useResetMachineHeartbeat(id)

  const licenseId = machine?.relationships.license?.data?.id || ""
  const {
    data: license,
    isLoading: licenseLoading,
    isError: licenseError,
  } = useGetLicense(licenseId)

  const groupId = machine?.relationships.group?.data?.id || ""
  const {
    data: group,
    isLoading: groupLoading,
    isError: groupError,
  } = useGetGroup(groupId)

  const ownerId = machine?.relationships.owner?.data?.id || ""
  const {
    data: owner,
    isLoading: ownerLoading,
    isError: ownerError,
  } = useGetUser(ownerId)

  const productId = machine?.relationships.product?.data?.id || ""
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
    checkOut: false,
    attributes: false,
    resetHeartbeat: false,
  })

  useEffect(() => {
    ;(async () => {
      if (machineError && !machineFetching) {
        await back()
      }
    })()
  }, [machineError, machineFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetHeartbeat = async () => {
    try {
      await resetHeartbeat.mutateAsync()
      toast({ message: "Machine heartbeat reset", variant: "success" })
      toggleOpen("resetHeartbeat", false)
    } catch {
      toast({ message: "Failed to reset machine heartbeat", variant: "error" })
    }
  }

  const handleDeleteMachine = async () => {
    try {
      await removeMachine.mutateAsync()
      toast({ message: "Machine deactivated", variant: "success" })
      await back()
    } catch {
      toast({ message: "Failed to deactivate machine", variant: "error" })
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
                  Machines
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {machine ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto">
                    {machine?.attributes.name ||
                      machine?.attributes.fingerprint}
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
                  disabled={machineLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                {machine?.attributes.requireHeartbeat && (
                  <Can permission="machine.heartbeat.reset">
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("resetHeartbeat", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Reset heartbeat
                    </DropdownMenuItem>
                    <Separator />
                  </Can>
                )}
                <Can permission="machine.check-out">
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("checkOut", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Checkout
                  </DropdownMenuItem>
                  <Separator />
                </Can>
                <Can permission="machine.update">
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
                <Can permission="machine.delete">
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("delete", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Deactivate
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              {machine?.attributes.requireHeartbeat && (
                <Can permission="machine.heartbeat.reset">
                  <Button
                    variant="outline"
                    disabled={machineLoading}
                    onClick={() => toggleOpen("resetHeartbeat", true)}
                  >
                    Reset heartbeat
                  </Button>
                </Can>
              )}
              <Can permission="machine.check-out">
                <Button
                  variant="outline"
                  disabled={machineLoading}
                  onClick={() => toggleOpen("checkOut", true)}
                >
                  Checkout
                </Button>
              </Can>
              <Can permission="machine.update">
                <Button
                  variant="outline"
                  disabled={machineLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="machine.delete">
                <Button
                  variant="outline"
                  disabled={machineLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Deactivate
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {machine ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {machine?.attributes.name || machine?.attributes.fingerprint}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(machine.id)}
                  className="w-fit pb-0.5"
                >
                  {machine.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Fingerprint"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={machine.attributes.fingerprint}
                            tooltip={MachineAttributeDescriptions.fingerprint}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Hostname"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={machine.attributes.hostname}
                            tooltip={MachineAttributeDescriptions.hostname}
                          />
                        }
                      />
                      <Attribute.Field
                        label="IP Address"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={machine.attributes.ip}
                            tooltip={MachineAttributeDescriptions.ip}
                          />
                        }
                      />
                    </div>

                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Platform"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={machine.attributes.platform}
                            tooltip={MachineAttributeDescriptions.platform}
                          />
                        }
                      />
                      <Attribute.Field
                        label="CPU Cores"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="number"
                            value={machine.attributes.cores}
                            tooltip={MachineAttributeDescriptions.cores}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Memory"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="bytes"
                            value={machine.attributes.memory ?? null}
                            tooltip={MachineAttributeDescriptions.memory}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Disk"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="bytes"
                            value={machine.attributes.disk ?? null}
                            tooltip={MachineAttributeDescriptions.disk}
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Heartbeat monitor">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Require Heartbeat"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="boolean"
                            value={machine.attributes.requireHeartbeat}
                            tooltip={
                              MachineAttributeDescriptions.requireHeartbeat
                            }
                          />
                        }
                      />
                      <Attribute.Field
                        label="Heartbeat Status"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="enum"
                            value={machine.attributes.heartbeatStatus}
                            tooltip={
                              MachineAttributeDescriptions.heartbeatStatus
                            }
                            forceDisabled={
                              getHeartbeatStatusVariant(
                                machine.attributes.heartbeatStatus,
                              ) === "disabled"
                            }
                          />
                        }
                      />
                      <Attribute.Field
                        label="Heartbeat Duration"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="duration"
                            value={machine.attributes.heartbeatDuration}
                            tooltip={
                              MachineAttributeDescriptions.heartbeatDuration
                            }
                          />
                        }
                      />
                    </div>

                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Last Heartbeat"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="date"
                            value={machine.attributes.lastHeartbeat}
                            tooltip={MachineAttributeDescriptions.lastHeartbeat}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Next Heartbeat"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="date"
                            value={machine.attributes.nextHeartbeat}
                            tooltip={MachineAttributeDescriptions.nextHeartbeat}
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
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

                  <Attribute.Field
                    variant="text"
                    label="Owner"
                    value={
                      ownerError ? (
                        <Badge variant="destructive">ERROR</Badge>
                      ) : ownerLoading ? (
                        <Skeleton className="h-5 w-32 rounded-sm" />
                      ) : owner ? (
                        <GoToButton
                          path="/$accountId/app/users/$id"
                          params={{
                            accountId: keygen.config.id,
                            id: owner.id,
                          }}
                          label={getUserLabel(owner)}
                        />
                      ) : (
                        "--"
                      )
                    }
                  />

                  <Attribute.Field
                    variant="text"
                    label="Group"
                    value={
                      groupError ? (
                        <Badge variant="destructive">ERROR</Badge>
                      ) : groupLoading ? (
                        <Skeleton className="h-5 w-32 rounded-sm" />
                      ) : group ? (
                        <GoToButton
                          path="/$accountId/app/groups/$id"
                          params={{
                            accountId: keygen.config.id,
                            id: group.id,
                          }}
                          label={group.attributes.name}
                        />
                      ) : (
                        "--"
                      )
                    }
                  />

                  <Attribute.Field
                    variant="text"
                    label="Components"
                    value={
                      <GoToButton
                        path="/$accountId/app/components"
                        params={{ accountId: keygen.config.id }}
                        label="View all"
                        disabled // TODO(cazden) Enable when components are implemented
                      />
                    }
                  />
                  <Attribute.Field
                    variant="text"
                    label="Processes"
                    value={
                      <GoToButton
                        path="/$accountId/app/processes"
                        params={{ accountId: keygen.config.id }}
                        label="View all"
                        disabled // TODO(cazden) Enable when processes are implemented
                      />
                    }
                  />
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={machine} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    {machine ? (
                      <CollapsibleMenu title="Properties" className="space-y-2">
                        <Attribute.Field
                          label="Created at"
                          value={formatDate(
                            new Date(String(machine.attributes.created)),
                            "PP",
                          )}
                        />
                        <Attribute.Field
                          label="Updated at"
                          value={formatDate(
                            new Date(String(machine.attributes.updated)),
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
                      filters={{ resource: { type: "machine", id } }}
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
                {machine ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(machine.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(machine.attributes.updated)),
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
                  filters={{ resource: { type: "machine", id } }}
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

      <Machines.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <Machines.Form.CheckOut
        open={open.checkOut}
        onOpenChange={(value) => toggleOpen("checkOut", value)}
      />

      <ConfirmationModal
        title={`Reset heartbeat for ${machine?.attributes.name || machine?.attributes.fingerprint}`}
        description={
          machine?.attributes.requireHeartbeat
            ? `Are you sure you want to reset the heartbeat monitor for this machine? Because the policy requires a heartbeat, this will cause the machine to be deactivated automatically after ${formatTtlLabel(machine.attributes.heartbeatDuration)} unless the machine begins sending a heartbeat again.`
            : "Are you sure you want to reset and stop the heartbeat monitor for this machine? This will not deactivate the machine."
        }
        open={open.resetHeartbeat}
        disabled={resetHeartbeat.isPending}
        onClose={() => toggleOpen("resetHeartbeat", false)}
        onConfirm={handleResetHeartbeat}
        label="Reset heartbeat"
        variant="default"
      />

      <ConfirmationModal
        title={`Deactivate ${machine?.attributes.name || machine?.attributes.fingerprint}`}
        description="Are you sure you want to deactivate this machine? This action cannot be undone."
        open={open.delete}
        disabled={machineLoading}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteMachine}
        label="Deactivate"
        variant="destructive"
        confirmText={machine?.attributes.name || "delete machine"}
      />

      {machine && (
        <Machines.AdvancedDialog
          id={machine.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
