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
  Ban,
  Cpu,
  Key,
  Logs,
  Copy,
  Menu,
  Hash,
  Users,
  Repeat,
  Shield,
  Monitor,
  GitFork,
  CircleX,
  CircleOff,
  SquarePen,
  SquarePlus,
  CircleCheck,
  CirclePause,
  TriangleAlert,
  EllipsisVertical,
} from "lucide-react"

import {
  MockLicenses,
  LicenseStatus,
  LicenseStatusLabels,
  LicenseStatusVariants,
  LicenseStatusDescriptions,
  LicenseAttributeDescriptions,
} from "@/types/licenses"

import { useGetPolicy } from "@/queries/policies"
import { useGetProduct } from "@/queries/products"

import { useMobile } from "@/hooks/use-mobile"

import { copyToClipboard } from "@/lib/clipboard"
import {
  getMachinesLimitDisplay,
  getUsersLimitDisplay,
  getProcessesLimitDisplay,
  getCoresLimitDisplay,
  getUsesLimitDisplay,
  isLimitOverridden,
} from "@/lib/licenses"

import * as keygen from "@/keygen"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as Licenses from "@/components/licenses"
import Metadata from "@/components/metadata"
import TooltipBadge from "@/components/tooltip-badge"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import GoToButton from "@/components/go-to-button"
import DeleteModal from "@/components/delete-modal"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"

const LicenseStatusIcons: Record<LicenseStatus, React.ReactNode> = {
  [LicenseStatus.Active]: <CircleCheck className="size-3" />,
  [LicenseStatus.Inactive]: <CirclePause className="size-3" />,
  [LicenseStatus.Expiring]: <TriangleAlert className="size-3" />,
  [LicenseStatus.Expired]: <CircleOff className="size-3" />,
  [LicenseStatus.Suspended]: <CircleX className="size-3" />,
  [LicenseStatus.Banned]: <Ban className="size-3" />,
}

export default function LicenseDetails() {
  const { licenseId } = useParams({ from: "/$id/app/licenses/$licenseId" })

  const license = MockLicenses.find((l) => l.id === licenseId)
  const [licenseLoading, setLicenseLoading] = useState(true)
  const [licenseFetching, setLicenseFetching] = useState(true)
  const licenseError = false

  const policyId = license?.relationships.policy?.data?.id || ""
  const {
    data: policy,
    isLoading: policyLoading,
    isFetching: policyFetching,
    isError: policyError,
  } = useGetPolicy(policyId)

  const productId = policy?.relationships.product?.data?.id || ""
  const {
    data: product,
    isLoading: productLoading,
    isFetching: productFetching,
    isError: productError,
  } = useGetProduct(productId)

  const navigate = useNavigate()

  const isMobile = useMobile()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    attributes: false,
  })

  useEffect(() => {
    ;(async () => {
      if (licenseError && !licenseFetching) {
        await navigate({ to: ".." })
      }
    })()
  }, [licenseError, licenseFetching, navigate])

  useEffect(() => {
    setTimeout(() => {
      setLicenseLoading(false)
      setLicenseFetching(false)
    }, 1000)
  }, [])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteLicense = () => {
    console.log("License deleted.")
    // TODO(cazden) Implement API call to delete license
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
                  Licenses
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {license ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto">
                    {license?.attributes.name || license?.attributes.key}
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
                  disabled={licenseLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
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
                disabled={licenseLoading}
                onClick={() => toggleOpen("edit", true)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                disabled={licenseLoading}
                onClick={() => toggleOpen("delete", true)}
              >
                Delete
              </Button>
            </div>
          )}
        </PageHeader>

        {license ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton path=".." className="mb-8" />

              <div className="mb-2 flex flex-wrap gap-2">
                <TooltipBadge
                  icon={LicenseStatusIcons[license.attributes.status]}
                  value={LicenseStatusLabels[license.attributes.status]}
                  variant={LicenseStatusVariants[license.attributes.status]}
                  tooltip={LicenseStatusDescriptions[license.attributes.status]}
                  className="px-1 text-xs"
                />
                {license.attributes.protected && (
                  <TooltipBadge
                    icon={<Shield className="size-3" />}
                    value="Protected"
                    variant="secondary"
                    tooltip={LicenseAttributeDescriptions.protected}
                    className="px-1 text-xs"
                  />
                )}
                {license.attributes.suspended &&
                  license.attributes.status !== LicenseStatus.Suspended && (
                    <TooltipBadge
                      icon={<CircleX className="size-3" />}
                      value="Suspended"
                      variant="destructive"
                      tooltip={LicenseAttributeDescriptions.suspended}
                      className="px-1 text-xs"
                    />
                  )}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {license?.attributes.name || (
                    <span className="text-lg font-normal text-content-disabled">
                      {"(name not set)"}
                    </span>
                  )}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(license.id)}
                  className="w-fit pb-0.5"
                >
                  {license.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-2 flex flex-col gap-1 text-sm text-content-subdued md:flex-row md:items-center md:gap-4">
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(license.attributes.key)}
                  className="w-fit border-none"
                >
                  <Key className="mr-1 size-4" />
                  <span className="w-64 truncate font-mono md:w-auto">
                    {license.attributes.key}
                  </span>
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
                    <div className="space-y-4 md:pr-3">
                      <Attribute.Field
                        label="Expiry"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              license.attributes.expiry
                                ? formatDate(
                                    new Date(license.attributes.expiry),
                                    "PPP",
                                  )
                                : null
                            }
                            tooltip={LicenseAttributeDescriptions.expiry}
                            emptyLabel="Never"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Last Check-in"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              license.attributes.lastCheckIn
                                ? formatDate(
                                    new Date(license.attributes.lastCheckIn),
                                    "PPP p",
                                  )
                                : null
                            }
                            tooltip={LicenseAttributeDescriptions.lastCheckIn}
                            emptyLabel="Never"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Last Validated"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              license.attributes.lastValidated
                                ? formatDate(
                                    new Date(license.attributes.lastValidated),
                                    "PPP p",
                                  )
                                : null
                            }
                            tooltip={LicenseAttributeDescriptions.lastValidated}
                            emptyLabel="Never"
                          />
                        }
                      />
                    </div>
                    <div className="mt-4 space-y-4 md:mt-0 md:pl-3">
                      <Attribute.Field
                        label="Next Check-in"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              license.attributes.nextCheckIn
                                ? formatDate(
                                    new Date(license.attributes.nextCheckIn),
                                    "PPP p",
                                  )
                                : null
                            }
                            tooltip={LicenseAttributeDescriptions.nextCheckIn}
                            emptyLabel="Not required"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Version"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={license.attributes.version}
                            tooltip={LicenseAttributeDescriptions.version}
                            emptyLabel="Not set"
                          />
                        }
                      />
                    </div>
                  </div>
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
                            path="/$id/app/products/$productId"
                            params={{
                              id: keygen.config.id,
                              productId: product.id,
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
                    <Attribute.Field
                      variant="text"
                      label="Policy"
                      value={
                        policyError ? (
                          <Badge variant="destructive">ERROR</Badge>
                        ) : policyLoading || policyFetching ? (
                          <Skeleton className="h-5 w-32 rounded-sm" />
                        ) : policy ? (
                          <GoToButton
                            path="/$id/app/policies/$policyId"
                            params={{
                              id: keygen.config.id,
                              policyId: policy.id,
                            }}
                            label={policy.attributes.name}
                          />
                        ) : policyId ? (
                          policyId
                        ) : (
                          "--"
                        )
                      }
                    />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={license} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    {license ? (
                      <>
                        <CollapsibleMenu
                          title="Properties"
                          className="space-y-2"
                        >
                          <Attribute.Field
                            label="Created at"
                            value={formatDate(
                              new Date(String(license.attributes.created)),
                              "PP",
                            )}
                          />
                          <Attribute.Field
                            label="Updated at"
                            value={formatDate(
                              new Date(String(license.attributes.updated)),
                              "PP",
                            )}
                          />
                        </CollapsibleMenu>

                        <Separator className="my-4" dashed />

                        <CollapsibleMenu
                          title="Usage limits"
                          className="space-y-2"
                        >
                          <Attribute.Field
                            label="Cores"
                            variant="none"
                            value={
                              <span className="flex items-center gap-1.5">
                                <TooltipBadge
                                  value={getCoresLimitDisplay(
                                    license,
                                    policy,
                                    0,
                                  )}
                                  variant={
                                    license.attributes.maxCores ||
                                    policy?.attributes.maxCores
                                      ? "default"
                                      : "disabled"
                                  }
                                  tooltip={
                                    LicenseAttributeDescriptions.maxCores
                                  }
                                />
                                {isLimitOverridden(
                                  license.attributes.maxCores,
                                  policy?.attributes.maxCores,
                                ) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Overridden
                                  </Badge>
                                )}
                              </span>
                            }
                          />
                          <Attribute.Field
                            label="Machines"
                            variant="none"
                            value={
                              <span className="flex items-center gap-1.5">
                                <TooltipBadge
                                  value={getMachinesLimitDisplay(
                                    license,
                                    policy,
                                    license.relationships.machines?.data
                                      ?.length ?? 0,
                                  )}
                                  variant={
                                    license.attributes.maxMachines ||
                                    policy?.attributes.maxMachines
                                      ? "default"
                                      : "disabled"
                                  }
                                  tooltip={
                                    LicenseAttributeDescriptions.maxMachines
                                  }
                                />
                                {isLimitOverridden(
                                  license.attributes.maxMachines,
                                  policy?.attributes.maxMachines,
                                ) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Overridden
                                  </Badge>
                                )}
                              </span>
                            }
                          />
                          <Attribute.Field
                            label="Processes"
                            variant="none"
                            value={
                              <span className="flex items-center gap-1.5">
                                <TooltipBadge
                                  value={getProcessesLimitDisplay(
                                    license,
                                    policy,
                                    0,
                                  )}
                                  variant={
                                    license.attributes.maxProcesses ||
                                    policy?.attributes.maxProcesses
                                      ? "default"
                                      : "disabled"
                                  }
                                  tooltip={
                                    LicenseAttributeDescriptions.maxProcesses
                                  }
                                />
                                {isLimitOverridden(
                                  license.attributes.maxProcesses,
                                  policy?.attributes.maxProcesses,
                                ) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Overridden
                                  </Badge>
                                )}
                              </span>
                            }
                          />
                          <Attribute.Field
                            label="Users"
                            variant="none"
                            value={
                              <span className="flex items-center gap-1.5">
                                <TooltipBadge
                                  value={getUsersLimitDisplay(
                                    license,
                                    policy,
                                    license.relationships.users?.data?.length ??
                                      0,
                                  )}
                                  variant={
                                    license.attributes.maxUsers ||
                                    policy?.attributes.maxUsers
                                      ? "default"
                                      : "disabled"
                                  }
                                  tooltip={
                                    LicenseAttributeDescriptions.maxUsers
                                  }
                                />
                                {isLimitOverridden(
                                  license.attributes.maxUsers,
                                  policy?.attributes.maxUsers,
                                ) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Overridden
                                  </Badge>
                                )}
                              </span>
                            }
                          />
                          <Attribute.Field
                            label="Uses"
                            variant="none"
                            value={
                              <span className="flex items-center gap-1.5">
                                <TooltipBadge
                                  value={getUsesLimitDisplay(license, policy)}
                                  variant={
                                    license.attributes.maxUses ||
                                    policy?.attributes.maxUses
                                      ? "default"
                                      : "disabled"
                                  }
                                  tooltip={LicenseAttributeDescriptions.maxUses}
                                />
                                {isLimitOverridden(
                                  license.attributes.maxUses,
                                  policy?.attributes.maxUses,
                                ) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Overridden
                                  </Badge>
                                )}
                              </span>
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
                {license ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(license.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(license.attributes.updated)),
                          "PP",
                        )}
                      />
                    </Property.Section>

                    <Separator />

                    <Property.Section title="Usage limits" className="p-4">
                      <Property.Field
                        icon={Cpu}
                        label="cores"
                        variant="reverse"
                        value={getCoresLimitDisplay(license, policy, 0)}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxCores,
                            policy?.attributes.maxCores,
                          ) && (
                            <Badge
                              variant="secondary"
                              className="ml-1.5 text-[10px]"
                            >
                              Overridden
                            </Badge>
                          )
                        }
                      />
                      <Property.Field
                        icon={Monitor}
                        label="machines"
                        variant="reverse"
                        value={getMachinesLimitDisplay(
                          license,
                          policy,
                          license.relationships.machines?.data?.length ?? 0,
                        )}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxMachines,
                            policy?.attributes.maxMachines,
                          ) && (
                            <Badge
                              variant="secondary"
                              className="ml-1.5 text-[10px]"
                            >
                              Overridden
                            </Badge>
                          )
                        }
                      />
                      <Property.Field
                        icon={Repeat}
                        label="processes"
                        variant="reverse"
                        value={getProcessesLimitDisplay(license, policy, 0)}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxProcesses,
                            policy?.attributes.maxProcesses,
                          ) && (
                            <Badge
                              variant="secondary"
                              className="ml-1.5 text-[10px]"
                            >
                              Overridden
                            </Badge>
                          )
                        }
                      />
                      <Property.Field
                        icon={Users}
                        label="users"
                        variant="reverse"
                        value={getUsersLimitDisplay(
                          license,
                          policy,
                          license.relationships.users?.data?.length ?? 0,
                        )}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxUsers,
                            policy?.attributes.maxUsers,
                          ) && (
                            <Badge
                              variant="secondary"
                              className="ml-1.5 text-[10px]"
                            >
                              Overridden
                            </Badge>
                          )
                        }
                      />
                      <Property.Field
                        icon={Hash}
                        label="uses"
                        variant="reverse"
                        value={getUsesLimitDisplay(license, policy)}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxUses,
                            policy?.attributes.maxUses,
                          ) && (
                            <Badge
                              variant="secondary"
                              className="ml-1.5 text-[10px]"
                            >
                              Overridden
                            </Badge>
                          )
                        }
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

      <Licenses.Edit.Modal
        open={open.edit}
        onClose={() => toggleOpen("edit", false)}
        license={license!}
      />

      <DeleteModal
        title={`Delete ${license?.attributes.name || license?.attributes.key}`}
        description="Are you sure you want to delete this license?"
        open={open.delete}
        disabled={licenseLoading}
        onClose={() => toggleOpen("delete", false)}
        onDelete={handleDeleteLicense}
      />

      {license && (
        <Licenses.AdvancedDialog
          id={license.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
