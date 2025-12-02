import { useState, useEffect } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
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
  Menu,
  GitFork,
  Copy,
  SquarePlus,
  SquarePen,
  EllipsisVertical,
  Package,
  Clock,
  ChevronRight,
  Logs,
  Cpu,
  Repeat,
  Users,
} from "lucide-react"

import { MockPolicies } from "@/types/policies"

import { useGetProduct } from "@/queries/products"
import { useListEntitlements } from "@/queries/entitlements"
// import { useGetPolicy, useRemovePolicy } from "@/queries/policies"

import { useMobile } from "@/hooks/use-mobile"

// import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"
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

import * as keygen from "@/keygen"
import * as Attribute from "@/components/attribute"
import * as Property from "@/components/property"
import * as Policies from "@/components/policies"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import DeleteModal from "@/components/delete-modal"
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"

export default function PolicyDetails() {
  const { policyId } = useParams({ from: "/$id/app/policies/$policyId" })
  // const { data: policy, isLoading: policyLoading, isFetching: policyFetching, isError: policyError } = useGetPolicy(policyId)
  const policy = MockPolicies.find((p) => p.id === policyId)
  const [policyLoading, setPolicyLoading] = useState(true)
  const [policyFetching, setPolicyFetching] = useState(true)
  const policyError = false
  // const deletePolicy = useRemovePolicy(policyId)

  const productId = policy?.relationships.product?.data?.id || ""
  const {
    data: product,
    isLoading: productLoading,
    isFetching: productFetching,
    isError: productError,
  } = useGetProduct(productId)

  const {
    data: entitlementsData = [],
    isLoading: entitlementsLoading,
    isFetching: entitlementsFetching,
    isError: entitlementsError,
  } = useListEntitlements()

  // TODO(cazden) Derive entitlements properly once policy API is implemented
  const entitlementIds = (policy?.relationships.entitlements?.data ?? [])
    .map((entitlement: { id: string }) => entitlement.id || entitlement)
    .filter(Boolean)
  const entitlements = entitlementIds.length
    ? entitlementsData.filter((e) => entitlementIds.includes(e.id))
    : []

  const navigate = useNavigate()

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
        await navigate({ to: ".." })
      }
    })()
  }, [policyError, policyFetching, navigate])

  useEffect(() => {
    setTimeout(() => {
      setPolicyLoading(false)
      setPolicyFetching(false)
    }, 1000)
  }, [])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeletePolicy = () => {
    console.log("Policy deleted.")

    // deletePolicy.mutate(undefined, {
    //   onSuccess: () => {
    //     toast({
    //       message: "Policy deleted",
    //       variant: "success",
    //     })
    //     navigate({ to: ".." })
    //   },
    // })
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
                  onClick={() => navigate({ to: `..` })}
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
                <DropdownMenuItem
                  onClick={(e) => {
                    toggleOpen("duplicate", true)
                    e.currentTarget.blur()
                  }}
                  className="pb-2 text-base"
                >
                  Duplicate
                </DropdownMenuItem>
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
                <DropdownMenuItem
                  onClick={(e) => {
                    toggleOpen("delete", true)
                    e.currentTarget.blur()
                  }}
                  className="pb-2 text-base"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                disabled={policyLoading}
                onClick={() => toggleOpen("duplicate", true)}
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                disabled={policyLoading}
                onClick={() => toggleOpen("edit", true)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                disabled={policyLoading}
                onClick={() => toggleOpen("delete", true)}
              >
                Delete
              </Button>
            </div>
          )}
        </PageHeader>

        {policy ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton path=".." className="mb-8" />
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
                {isFeatureBased(policy) && (
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
                <Package className="mr-2 size-4 pt-0.5" />
                <span>Product:</span>
                {product ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="link"
                      size="link"
                      className="peer ml-3 text-content-muted"
                      onClick={async () => {
                        await navigate({
                          to: "/$id/app/products/$productId",
                          params: {
                            id: keygen.config.id,
                            productId: product.id,
                          },
                        })
                      }}
                    >
                      {product?.attributes.name}
                    </Button>
                    <ChevronRight className="mt-0.5 size-3.5 transition-all duration-200 peer-hover:translate-x-2 peer-hover:text-brand-primary" />
                  </div>
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
                          <div className="flex items-center gap-1">
                            <Button
                              variant="link"
                              size="link"
                              className="peer text-content-muted"
                              onClick={() =>
                                navigate({
                                  to: "/$id/app/entitlements/$entitlementId",
                                  params: {
                                    id: keygen.config.id,
                                    entitlementId: entitlement.id,
                                  },
                                })
                              }
                            >
                              {entitlement.attributes.name}
                            </Button>
                            <ChevronRight className="mt-0.5 size-3.5 transition-all duration-200 peer-hover:translate-x-2 peer-hover:text-brand-primary" />
                          </div>

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
                          <button
                            className="text-primary underline-offset-4 hover:underline"
                            onClick={() =>
                              navigate({
                                to: "/$id/app/products/$productId",
                                params: {
                                  id: keygen.config.id,
                                  productId: product.id,
                                },
                              })
                            }
                          >
                            {product.attributes.name}
                          </button>
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
                  <ScrollArea className="min-h-0 w-full min-w-0">
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
                          {JSON.stringify(policy.attributes.metadata, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-sm text-content-muted">{"{ }"}</p>
                    )}
                  </ScrollArea>
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
                          title="Usage Requirements"
                          className="space-y-2"
                        >
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
                                tooltip="Todo"
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
                                tooltip="Todo"
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
                                tooltip="Todo"
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
                    <p className="text-sm text-content-subdued">
                      Nothing here yet.
                    </p>
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
                        label="max machines"
                        emptyLabel="No max machines set"
                        value={policy.attributes.maxMachines}
                      />
                      <Property.Field
                        icon={Repeat}
                        variant="reverse"
                        label="max processes"
                        emptyLabel="No max processes set"
                        value={policy.attributes.maxProcesses}
                      />
                      <Property.Field
                        icon={Users}
                        variant="reverse"
                        label="max users"
                        emptyLabel="No max users set"
                        value={policy.attributes.maxUsers}
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

              <TabsContent value="events" className="p-4"></TabsContent>
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

      <Policies.AdvancedDialog
        id={policy!.id}
        open={open.attributes}
        onOpenChange={() => toggleOpen("attributes", false)}
      />

      <Policies.Edit.Modal
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <Policies.Duplicate.Modal
        open={open.duplicate}
        onOpenChange={(value) => toggleOpen("duplicate", value)}
      />

      <DeleteModal
        title={`Delete ${policy?.attributes.name}`}
        description="Are you sure you want to delete this policy?"
        open={open.delete}
        disabled={policyLoading || productLoading}
        onClose={() => toggleOpen("delete", false)}
        onDelete={handleDeletePolicy}
      />
    </section>
  )
}
