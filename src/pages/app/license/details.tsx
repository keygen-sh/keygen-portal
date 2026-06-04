import { useState, useEffect } from "react"
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
  DropdownMenuSeparator,
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
  HardDrive,
  SquarePen,
  CircleOff,
  SquarePlus,
  MemoryStick,
  CircleCheck,
  CirclePause,
  ChevronDown,
  TriangleAlert,
  EllipsisVertical,
} from "lucide-react"

import {
  LicenseStatus,
  LicenseStatusLabels,
  LicenseStatusVariants,
  LicenseStatusDescriptions,
  LicenseAttributeDescriptions,
} from "@/types/licenses"

import { useGetUser } from "@/queries/users"
import { useGetPolicy } from "@/queries/policies"
import { useGetProduct } from "@/queries/products"
import {
  useGetLicense,
  useRemoveLicense,
  useSuspendLicense,
  useReinstateLicense,
  useRenewLicense,
  useCheckInLicense,
  useResetUsageLicense,
  useListLicenseEntitlements,
  useListLicenseUsers,
} from "@/queries/licenses"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { getUserLabel } from "@/lib/users"
import { copyToClipboard } from "@/lib/clipboard"
import {
  getMachinesLimitDisplay,
  getUsersLimitDisplay,
  getProcessesLimitDisplay,
  getCoresLimitDisplay,
  getMachineMetricCount,
  getByteUsageLimit,
  getUsesLimitDisplay,
  isLimitOverridden,
  truncateKey,
} from "@/lib/licenses"

import * as keygen from "@/keygen"
import * as Property from "@/components/property"
import * as Licenses from "@/components/licenses"
import * as Attribute from "@/components/attribute"
import Can from "@/components/can"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import GoToButton from "@/components/go-to-button"
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"
import ConfirmationModal from "@/components/confirmation-modal"
import LimitBadge, { OverriddenBadge } from "@/components/limit-badge"

const LicenseStatusIcons: Record<LicenseStatus, React.ReactNode> = {
  [LicenseStatus.Active]: <CircleCheck className="size-3" />,
  [LicenseStatus.Inactive]: <CirclePause className="size-3" />,
  [LicenseStatus.Expiring]: <TriangleAlert className="size-3" />,
  [LicenseStatus.Expired]: <CircleOff className="size-3" />,
  [LicenseStatus.Suspended]: <CircleX className="size-3" />,
  [LicenseStatus.Banned]: <Ban className="size-3" />,
}

export default function LicenseDetails() {
  const { id } = useParams({ from: "/$accountId/app/licenses/$id" })

  const {
    data: license,
    isLoading: licenseLoading,
    isFetching: licenseFetching,
    isError: licenseError,
  } = useGetLicense(id)
  const removeLicense = useRemoveLicense(id)
  const suspendLicense = useSuspendLicense(id)
  const reinstateLicense = useReinstateLicense(id)
  const renewLicense = useRenewLicense(id)
  const checkInLicense = useCheckInLicense(id)
  const resetUsageLicense = useResetUsageLicense(id)

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

  const ownerId = license?.relationships.owner?.data?.id || ""
  const {
    data: owner,
    isLoading: ownerLoading,
    isFetching: ownerFetching,
    isError: ownerError,
  } = useGetUser(ownerId)

  const {
    data: entitlements = [],
    isLoading: entitlementsLoading,
    isFetching: entitlementsFetching,
    isError: entitlementsError,
  } = useListLicenseEntitlements(id)

  const { data: licenseUsers = [] } = useListLicenseUsers(id)

  const back = useBackNavigate()

  const isMobile = useMobile()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    suspend: false,
    renew: false,
    checkIn: false,
    resetUsage: false,
    attributes: false,
    checkOut: false,
  })

  useEffect(() => {
    ;(async () => {
      if (licenseError && !licenseFetching) {
        await back()
      }
    })()
  }, [licenseError, licenseFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteLicense = async () => {
    try {
      await removeLicense.mutateAsync()
      toast({ message: "License deleted", variant: "success" })
      await back()
    } catch {
      toast({ message: "Failed to delete license", variant: "error" })
    }
  }

  const handleSuspendLicense = async () => {
    try {
      await suspendLicense.mutateAsync()
      toast({ message: "License suspended", variant: "success" })
      toggleOpen("suspend", false)
    } catch {
      toast({ message: "Failed to suspend license", variant: "error" })
    }
  }

  const handleReinstateLicense = async () => {
    try {
      await reinstateLicense.mutateAsync()
      toast({ message: "License reinstated", variant: "success" })
      toggleOpen("suspend", false)
    } catch {
      toast({ message: "Failed to reinstate license", variant: "error" })
    }
  }

  const handleRenewLicense = async () => {
    try {
      await renewLicense.mutateAsync()
      toast({ message: "License renewed", variant: "success" })
      toggleOpen("renew", false)
    } catch (e) {
      toast({
        message: "Failed to renew license",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      })
    }
  }

  const handleCheckInLicense = async () => {
    try {
      await checkInLicense.mutateAsync()
      toast({ message: "License checked in", variant: "success" })
      toggleOpen("checkIn", false)
    } catch (e) {
      toast({
        message: "Failed to check in license",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      })
    }
  }

  const handleResetUsageLicense = async () => {
    try {
      await resetUsageLicense.mutateAsync()
      toast({ message: "License usage reset", variant: "success" })
      toggleOpen("resetUsage", false)
    } catch {
      toast({ message: "Failed to reset license usage", variant: "error" })
    }
  }

  const memoryUsageLimit = license
    ? getByteUsageLimit(license, policy, "memory")
    : undefined
  const diskUsageLimit = license
    ? getByteUsageLimit(license, policy, "disk")
    : undefined

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
                  Licenses
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {license ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto">
                    {license.attributes.name ||
                      truncateKey(license.attributes.key, {
                        maxLength: isMobile ? 16 : 64,
                      })}
                  </BreadcrumbPage>
                ) : (
                  <Skeleton className="h-6 w-32" />
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {isMobile ? (
            <Can.Any
              permissions={[
                "license.update",
                "license.delete",
                "license.renew",
                "license.suspend",
                "license.reinstate",
                "license.check-in",
                "license.check-out",
                "license.usage.reset",
              ]}
            >
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
                  <Can permission="license.update">
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("edit", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </Can>
                  <Can permission="license.delete">
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("delete", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </Can>
                  <Can permission="license.renew">
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("renew", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Renew
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </Can>
                  <Can
                    permission={
                      license?.attributes.suspended
                        ? "license.reinstate"
                        : "license.suspend"
                    }
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("suspend", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      {license?.attributes.suspended ? "Reinstate" : "Suspend"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </Can>
                  {license?.attributes.requireCheckIn && (
                    <Can permission="license.check-in">
                      <DropdownMenuItem
                        onClick={(e) => {
                          toggleOpen("checkIn", true)
                          e.currentTarget.blur()
                        }}
                        className="pb-2 text-base"
                      >
                        Check-in
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </Can>
                  )}
                  <Can permission="license.check-out">
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("checkOut", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Checkout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </Can>
                  <Can permission="license.usage.reset">
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("resetUsage", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Reset usage
                    </DropdownMenuItem>
                  </Can>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can.Any>
          ) : (
            <div className="flex items-center space-x-2">
              <Can.Any
                permissions={[
                  "license.renew",
                  "license.suspend",
                  "license.reinstate",
                  "license.check-in",
                  "license.check-out",
                  "license.usage.reset",
                ]}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={licenseLoading}>
                      Actions
                      <ChevronDown className="size-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Can permission="license.renew">
                      <DropdownMenuItem
                        onClick={(e) => {
                          toggleOpen("renew", true)
                          e.currentTarget.blur()
                        }}
                      >
                        Renew
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </Can>
                    <Can
                      permission={
                        license?.attributes.suspended
                          ? "license.reinstate"
                          : "license.suspend"
                      }
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          toggleOpen("suspend", true)
                          e.currentTarget.blur()
                        }}
                      >
                        {license?.attributes.suspended
                          ? "Reinstate"
                          : "Suspend"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </Can>
                    {license?.attributes.requireCheckIn && (
                      <Can permission="license.check-in">
                        <DropdownMenuItem
                          onClick={(e) => {
                            toggleOpen("checkIn", true)
                            e.currentTarget.blur()
                          }}
                        >
                          Check-in
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </Can>
                    )}
                    <Can permission="license.check-out">
                      <DropdownMenuItem
                        onClick={(e) => {
                          toggleOpen("checkOut", true)
                          e.currentTarget.blur()
                        }}
                      >
                        Checkout
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </Can>
                    <Can permission="license.usage.reset">
                      <DropdownMenuItem
                        onClick={(e) => {
                          toggleOpen("resetUsage", true)
                          e.currentTarget.blur()
                        }}
                      >
                        Reset usage
                      </DropdownMenuItem>
                    </Can>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Can.Any>
              <Can permission="license.update">
                <Button
                  variant="outline"
                  disabled={licenseLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="license.delete">
                <Button
                  variant="outline"
                  disabled={licenseLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {license ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

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
                    <span className="flex items-center text-lg font-normal text-content-disabled">
                      {"(name not set)"}
                    </span>
                  )}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(license.id)}
                  className="w-fit"
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
                  <span className="font-mono">
                    {truncateKey(license.attributes.key, {
                      maxLength: isMobile ? 24 : 64,
                    })}
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
                      </div>
                    ))
                  ) : (
                    <Attribute.Field
                      variant="text"
                      label="None"
                      value={<Badge variant="disabled">Not set</Badge>}
                    />
                  )}
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
                          <Badge variant="disabled">Not set</Badge>
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
                            path="/$accountId/app/policies/$id"
                            params={{
                              accountId: keygen.config.id,
                              id: policy.id,
                            }}
                            label={policy.attributes.name}
                          />
                        ) : policyId ? (
                          policyId
                        ) : (
                          <Badge variant="disabled">Not set</Badge>
                        )
                      }
                    />
                    <Attribute.Field
                      variant="text"
                      label="Owner"
                      value={
                        ownerError ? (
                          <Badge variant="destructive">ERROR</Badge>
                        ) : ownerLoading || ownerFetching ? (
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
                          <Badge variant="disabled">Not set</Badge>
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
                                    getMachineMetricCount(license, "cores"),
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
                                ) && <OverriddenBadge className="ml-0" />}
                              </span>
                            }
                          />
                          <Attribute.Field
                            label="Memory"
                            variant="none"
                            value={
                              memoryUsageLimit && (
                                <LimitBadge {...memoryUsageLimit} />
                              )
                            }
                          />
                          <Attribute.Field
                            label="Disk"
                            variant="none"
                            value={
                              diskUsageLimit && (
                                <LimitBadge {...diskUsageLimit} />
                              )
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
                                ) && <OverriddenBadge className="ml-0" />}
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
                                ) && <OverriddenBadge className="ml-0" />}
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
                                ) && <OverriddenBadge className="ml-0" />}
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
                                ) && <OverriddenBadge className="ml-0" />}
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
                        value={getCoresLimitDisplay(
                          license,
                          policy,
                          getMachineMetricCount(license, "cores"),
                        )}
                        tooltip={LicenseAttributeDescriptions.maxCores}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxCores,
                            policy?.attributes.maxCores,
                          ) && <OverriddenBadge />
                        }
                      />
                      <Property.Field
                        icon={MemoryStick}
                        label="memory"
                        variant="reverse"
                        value={memoryUsageLimit?.value}
                        hoverValue={memoryUsageLimit?.hoverValue}
                        tooltip={memoryUsageLimit?.tooltip}
                        suffix={
                          memoryUsageLimit?.overridden && <OverriddenBadge />
                        }
                      />
                      <Property.Field
                        icon={HardDrive}
                        label="disk"
                        variant="reverse"
                        value={diskUsageLimit?.value}
                        hoverValue={diskUsageLimit?.hoverValue}
                        tooltip={diskUsageLimit?.tooltip}
                        suffix={
                          diskUsageLimit?.overridden && <OverriddenBadge />
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
                        tooltip={LicenseAttributeDescriptions.maxMachines}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxMachines,
                            policy?.attributes.maxMachines,
                          ) && <OverriddenBadge />
                        }
                      />
                      <Property.Field
                        icon={Repeat}
                        label="processes"
                        variant="reverse"
                        value={getProcessesLimitDisplay(license, policy, 0)}
                        tooltip={LicenseAttributeDescriptions.maxProcesses}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxProcesses,
                            policy?.attributes.maxProcesses,
                          ) && <OverriddenBadge />
                        }
                      />
                      <Property.Field
                        icon={Users}
                        label="users"
                        variant="reverse"
                        value={getUsersLimitDisplay(
                          license,
                          policy,
                          licenseUsers.length,
                        )}
                        tooltip={LicenseAttributeDescriptions.maxUsers}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxUsers,
                            policy?.attributes.maxUsers,
                          ) && <OverriddenBadge />
                        }
                      />
                      <Property.Field
                        icon={Hash}
                        label="uses"
                        variant="reverse"
                        value={getUsesLimitDisplay(license, policy)}
                        tooltip={LicenseAttributeDescriptions.maxUses}
                        suffix={
                          isLimitOverridden(
                            license.attributes.maxUses,
                            policy?.attributes.maxUses,
                          ) && <OverriddenBadge />
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

      <Licenses.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      {license && (
        <ConfirmationModal
          title={`Delete ${license.attributes.name || truncateKey(license.attributes.key, { maxLength: isMobile ? 16 : 32 })}`}
          description="Are you sure you want to delete this license?"
          open={open.delete}
          disabled={licenseLoading}
          onClose={() => toggleOpen("delete", false)}
          onConfirm={handleDeleteLicense}
          label="Delete"
          variant="destructive"
          confirmText={license.attributes.name || "delete license"}
        />
      )}

      {license && (
        <ConfirmationModal
          title={`${license.attributes.suspended ? "Reinstate" : "Suspend"} ${license.attributes.name || truncateKey(license.attributes.key, { maxLength: isMobile ? 16 : 32 })}`}
          description={
            license.attributes.suspended
              ? "Are you sure you want to reinstate this license?"
              : "Are you sure you want to suspend this license? Suspended licenses always fail validation."
          }
          open={open.suspend}
          disabled={suspendLicense.isPending || reinstateLicense.isPending}
          onClose={() => toggleOpen("suspend", false)}
          onConfirm={
            license.attributes.suspended
              ? handleReinstateLicense
              : handleSuspendLicense
          }
          label={license.attributes.suspended ? "Reinstate" : "Suspend"}
          variant={license.attributes.suspended ? "default" : "destructive"}
        />
      )}

      {license && (
        <ConfirmationModal
          title={`Renew ${license.attributes.name || truncateKey(license.attributes.key, { maxLength: isMobile ? 16 : 32 })}`}
          description="Are you sure you want to renew this license?"
          open={open.renew}
          disabled={renewLicense.isPending}
          onClose={() => toggleOpen("renew", false)}
          onConfirm={handleRenewLicense}
          label="Renew"
          variant="default"
        />
      )}

      {license && (
        <ConfirmationModal
          title={`Check in ${license.attributes.name || truncateKey(license.attributes.key, { maxLength: isMobile ? 16 : 32 })}`}
          description="Are you sure you want to check in this license? This will reset the check-in window."
          open={open.checkIn}
          disabled={checkInLicense.isPending}
          onClose={() => toggleOpen("checkIn", false)}
          onConfirm={handleCheckInLicense}
          label="Check in"
          variant="default"
        />
      )}

      {license && (
        <ConfirmationModal
          title={`Reset usage for ${license.attributes.name || truncateKey(license.attributes.key, { maxLength: isMobile ? 16 : 32 })}`}
          description="Are you sure you want to reset usage for this license? This will set the license's usage count back to zero."
          open={open.resetUsage}
          disabled={resetUsageLicense.isPending}
          onClose={() => toggleOpen("resetUsage", false)}
          onConfirm={handleResetUsageLicense}
          label="Reset Usage"
          variant="default"
        />
      )}

      {license && (
        <Licenses.Form.CheckOut
          open={open.checkOut}
          onOpenChange={(value) => toggleOpen("checkOut", value)}
        />
      )}

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
