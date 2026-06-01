import { useEffect } from "react"
import { useState } from "react"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Box,
  Cpu,
  Logs,
  Copy,
  Menu,
  Clock,
  Users,
  Repeat,
  GitFork,
  Monitor,
  HardDrive,
  MemoryStick,
  SquarePen,
  SquarePlus,
  EllipsisVertical,
} from "lucide-react"

import { useGetProduct } from "@/queries/products"
import {
  useGetPolicy,
  useRemovePolicy,
  useListPolicyEntitlements,
} from "@/queries/policies"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"
import { formatByteSize, formatRawByteSize } from "@/lib/bytes"

import {
  isPerpetual,
  isTimed,
  isPerpetualFallback,
  isNodeLocked,
  isUserLocked,
  isProcessBased,
  isLeaseBased,
  isFeatureBased,
  isUsageBased,
} from "@/lib/policies"
import { PolicyAttributeDescriptions } from "@/types/policies"

import * as keygen from "@/keygen"
import * as Policies from "@/components/policies"
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
import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"

export default function PolicyDetails() {
  const { id } = useParams({ from: "/$accountId/app/policies/$id" })
  const {
    data: policy,
    isLoading: policyLoading,
    isFetching: policyFetching,
    isError: policyError,
  } = useGetPolicy(id)
  const deletePolicy = useRemovePolicy(id)

  const productId = policy?.relationships.product?.data?.id || ""
  const {
    data: product,
    isLoading: productLoading,
    isFetching: productFetching,
    isError: productError,
  } = useGetProduct(productId)

  const {
    data: entitlements = [],
    isLoading: entitlementsLoading,
    isFetching: entitlementsFetching,
    isError: entitlementsError,
  } = useListPolicyEntitlements(id)

  const back = useBackNavigate()

  const isMobile = useMobile()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    duplicate: false,
    attributes: false,
  })

  useEffect(() => {
    ;(async () => {
      if (policyError && !policyFetching) {
        await back()
      }
    })()
  }, [policyError, policyFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeletePolicy = () => {
    deletePolicy.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Policy deleted",
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
                  Policies
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {policy ? (
                  <BreadcrumbPage>{policy.attributes.name}</BreadcrumbPage>
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
                  disabled={policyLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                <Can permission="policy.create">
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("duplicate", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Duplicate
                  </DropdownMenuItem>
                </Can>
                <Can permission="policy.update">
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
                <Can permission="policy.delete">
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
              <Can permission="policy.create">
                <Button
                  variant="outline"
                  disabled={policyLoading}
                  onClick={() => toggleOpen("duplicate", true)}
                >
                  Duplicate
                </Button>
              </Can>
              <Can permission="policy.update">
                <Button
                  variant="outline"
                  disabled={policyLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="policy.delete">
                <Button
                  variant="outline"
                  disabled={policyLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {policy ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />
              <div className="mb-2 flex flex-wrap gap-2">
                {isPerpetual(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Perpetual
                  </Badge>
                )}
                {isTimed(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Timed
                  </Badge>
                )}
                {isPerpetualFallback(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Perpetual-fallback
                  </Badge>
                )}
                {isNodeLocked(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Node-locked
                  </Badge>
                )}
                {isUserLocked(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    User-locked
                  </Badge>
                )}
                {isProcessBased(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Process-based
                  </Badge>
                )}
                {isLeaseBased(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Lease-based
                  </Badge>
                )}
                {isFeatureBased(entitlements) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Feature-based
                  </Badge>
                )}
                {isUsageBased(policy) && (
                  <Badge variant="secondary">
                    <Clock className="inline size-4" />
                    Usage-based
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {policy.attributes.name}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(policy.id)}
                  className="w-fit pb-0.5"
                >
                  {policy.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>
              <div className="mt-2 flex h-4 items-center text-sm text-content-subdued">
                <Box className="mr-2 size-4 pt-0.5" />
                <span>Product:</span>
                {product ? (
                  <GoToButton
                    path="/$accountId/app/products/$id"
                    params={{
                      accountId: keygen.config.id,
                      id: product.id,
                    }}
                    label={product.attributes.name}
                    className="ml-3"
                  />
                ) : (
                  <Skeleton className="mt-1 ml-3 h-6 w-48" />
                )}
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                {isTimed(policy) && (
                  <Policies.AttributeGroup
                    policy={policy}
                    title="Timed policy attributes"
                    keys={[
                      "duration",
                      "expirationStrategy",
                      "transferStrategy",
                      "expirationBasis",
                      "renewalBasis",
                    ]}
                  />
                )}

                {isNodeLocked(policy) && (
                  <Policies.AttributeGroup
                    policy={policy}
                    title="Node-locked policy attributes"
                    keys={[
                      "machineUniquenessStrategy",
                      "machineLeasingStrategy",
                      "componentUniquenessStrategy",
                      "overageStrategy",
                      "machineMatchingStrategy",
                      "processLeasingStrategy",
                      "componentMatchingStrategy",
                    ]}
                  />
                )}

                {isLeaseBased(policy) && (
                  <Policies.AttributeGroup
                    policy={policy}
                    title="Heartbeat attributes"
                    keys={[
                      "requireHeartbeat",
                      "heartbeatCullStrategy",
                      "heartbeatResurrectionStrategy",
                      "heartbeatDuration",
                      "heartbeatBasis",
                    ]}
                  />
                )}

                <CollapsibleCard
                  title="Entitlements"
                  subtitle={
                    <Badge className="ml-2 min-h-5 min-w-5 text-sm text-content-muted">
                      {entitlements.length}
                    </Badge>
                  }
                >
                  {entitlementsError ? (
                    <Badge variant="destructive">ERROR</Badge>
                  ) : entitlementsLoading || entitlementsFetching ? (
                    <div className="flex w-full justify-between">
                      <Skeleton className="h-5 w-48 rounded-sm" />
                      <Skeleton className="h-5 w-24 rounded-sm" />
                    </div>
                  ) : entitlements.length > 0 ? (
                    entitlements.map((entitlement) => (
                      <div key={entitlement.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <GoToButton
                            path="/$accountId/app/entitlements/$id"
                            params={{
                              accountId: keygen.config.id,
                              id: entitlement.id,
                            }}
                            label={entitlement.attributes.name}
                          />

                          <Badge className="bg-background-3 px-2 py-1 text-content-muted">
                            {entitlement.attributes.code}
                          </Badge>
                        </div>

                        {/* TODO(cazden) Implement usage tracking when meters is implemented */}
                        <div className="text-xs text-content-normal">
                          <span>No uses</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Attribute.Field variant="text" label="None" value="--" />
                  )}
                </CollapsibleCard>

                <CollapsibleCard title="Licenses">
                  <Attribute.Field variant="text" label="TODO" value={"--"} />
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <div className="grid gap-4">
                    <Attribute.Field
                      variant="text"
                      label="Product"
                      value={
                        productError ? (
                          <Badge variant="destructive">ERROR</Badge>
                        ) : productLoading || productFetching ? (
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
                        ) : productId ? (
                          productId
                        ) : (
                          "--"
                        )
                      }
                    />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={policy} />
                </CollapsibleCard>
                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    {policy ? (
                      <>
                        <CollapsibleMenu
                          title="Properties"
                          className="space-y-2"
                        >
                          <Attribute.Field
                            label="Created at"
                            value={formatDate(
                              new Date(String(policy.attributes.created)),
                              "PP",
                            )}
                          />
                          <Attribute.Field
                            label="Updated at"
                            value={formatDate(
                              new Date(String(policy.attributes.updated)),
                              "PP",
                            )}
                          />
                        </CollapsibleMenu>

                        <Separator className="my-6" dashed />

                        <CollapsibleMenu
                          title="Usage requirements"
                          className="space-y-2"
                        >
                          <Attribute.Field
                            label="Max cores"
                            variant="none"
                            value={
                              <TooltipBadge
                                value={policy.attributes.maxCores || "Not set"}
                                variant={
                                  policy.attributes.maxCores
                                    ? "default"
                                    : "disabled"
                                }
                                tooltip={PolicyAttributeDescriptions.maxCores}
                              />
                            }
                          />
                          <Attribute.Field
                            label="Max memory"
                            variant="none"
                            value={
                              <Attribute.Value
                                type="bytes"
                                value={policy.attributes.maxMemory}
                                emptyLabel="Not set"
                                tooltip={PolicyAttributeDescriptions.maxMemory}
                              />
                            }
                          />
                          <Attribute.Field
                            label="Max disk"
                            variant="none"
                            value={
                              <Attribute.Value
                                type="bytes"
                                value={policy.attributes.maxDisk}
                                emptyLabel="Not set"
                                tooltip={PolicyAttributeDescriptions.maxDisk}
                              />
                            }
                          />
                          <Attribute.Field
                            label="Max machines"
                            variant="none"
                            value={
                              <TooltipBadge
                                value={
                                  policy.attributes.maxMachines || "Not set"
                                }
                                variant={
                                  policy.attributes.maxMachines
                                    ? "default"
                                    : "disabled"
                                }
                                tooltip={
                                  PolicyAttributeDescriptions.maxMachines
                                }
                              />
                            }
                          />
                          <Attribute.Field
                            label="Max processes"
                            variant="none"
                            value={
                              <TooltipBadge
                                value={
                                  policy.attributes.maxProcesses || "Not set"
                                }
                                variant={
                                  policy.attributes.maxProcesses
                                    ? "default"
                                    : "disabled"
                                }
                                tooltip={
                                  PolicyAttributeDescriptions.maxProcesses
                                }
                              />
                            }
                          />
                          <Attribute.Field
                            label="Max users"
                            variant="none"
                            value={
                              <TooltipBadge
                                value={policy.attributes.maxUsers || "Not set"}
                                variant={
                                  policy.attributes.maxUsers
                                    ? "default"
                                    : "disabled"
                                }
                                tooltip={PolicyAttributeDescriptions.maxUsers}
                              />
                            }
                          />
                        </CollapsibleMenu>
                      </>
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
                      filters={{ resource: { type: "policies", id } }}
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
                {policy ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(policy.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(policy.attributes.updated)),
                          "PP",
                        )}
                      />
                    </Property.Section>

                    <Separator />

                    <Property.Section
                      title="Usage Requirements"
                      className="p-4"
                    >
                      <Property.Field
                        icon={Cpu}
                        variant="reverse"
                        label="max cores"
                        emptyLabel="No max cores set"
                        value={policy.attributes.maxCores}
                        tooltip={PolicyAttributeDescriptions.maxCores}
                      />
                      <Property.Field
                        icon={MemoryStick}
                        variant="reverse"
                        label="max memory"
                        emptyLabel="No max memory set"
                        value={
                          policy.attributes.maxMemory == null
                            ? null
                            : formatByteSize(policy.attributes.maxMemory)
                        }
                        hoverValue={
                          policy.attributes.maxMemory == null ||
                          policy.attributes.maxMemory === 0
                            ? undefined
                            : formatRawByteSize(policy.attributes.maxMemory)
                        }
                        tooltip={PolicyAttributeDescriptions.maxMemory}
                      />
                      <Property.Field
                        icon={HardDrive}
                        variant="reverse"
                        label="max disk"
                        emptyLabel="No max disk set"
                        value={
                          policy.attributes.maxDisk == null
                            ? null
                            : formatByteSize(policy.attributes.maxDisk)
                        }
                        hoverValue={
                          policy.attributes.maxDisk == null ||
                          policy.attributes.maxDisk === 0
                            ? undefined
                            : formatRawByteSize(policy.attributes.maxDisk)
                        }
                        tooltip={PolicyAttributeDescriptions.maxDisk}
                      />
                      <Property.Field
                        icon={Monitor}
                        variant="reverse"
                        label="max machines"
                        emptyLabel="No max machines set"
                        value={policy.attributes.maxMachines}
                        tooltip={PolicyAttributeDescriptions.maxMachines}
                      />
                      <Property.Field
                        icon={Repeat}
                        variant="reverse"
                        label="max processes"
                        emptyLabel="No max processes set"
                        value={policy.attributes.maxProcesses}
                        tooltip={PolicyAttributeDescriptions.maxProcesses}
                      />
                      <Property.Field
                        icon={Users}
                        variant="reverse"
                        label="max users"
                        emptyLabel="No max users set"
                        value={policy.attributes.maxUsers}
                        tooltip={PolicyAttributeDescriptions.maxUsers}
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
                  filters={{ resource: { type: "policies", id } }}
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

      {policy && (
        <Policies.AdvancedDialog
          id={policy.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}

      <Policies.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <Policies.Form.Duplicate
        open={open.duplicate}
        onOpenChange={(value) => toggleOpen("duplicate", value)}
      />

      <ConfirmationModal
        title={`Delete ${policy?.attributes.name}`}
        description="Are you sure you want to delete this policy?"
        open={open.delete}
        disabled={policyLoading || productLoading}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeletePolicy}
        label="Delete"
        variant="destructive"
        confirmText={policy?.attributes.name || "delete policy"}
      />
    </section>
  )
}
