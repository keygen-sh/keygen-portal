import { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
  Box,
  Logs,
  Menu,
  Copy,
  Binary,
  GitFork,
  Package,
  TestTube,
  CircleOff,
  SquarePen,
  SquarePlus,
  CircleCheck,
  PackageOpen,
  CircleDashed,
  FlaskConical,
  EllipsisVertical,
} from "lucide-react"

import { Artifact } from "@/types/artifacts"
import {
  ReleaseStatus,
  ReleaseChannel,
  ReleaseStatusLabels,
  ReleaseChannelLabels,
  ReleaseStatusVariants,
  ReleaseStatusDescriptions,
  ReleaseChannelDescriptions,
  ReleaseAttributeDescriptions,
  ReleaseConstraint,
} from "@/types/releases"

import * as keygen from "@/keygen"

import { useGetProduct } from "@/queries/products"
import { useGetPackage } from "@/queries/packages"
import { useGetEntitlement } from "@/queries/entitlements"
import {
  useGetRelease,
  useYankRelease,
  useRemoveRelease,
  usePublishRelease,
  useListReleaseArtifacts,
  useListReleaseConstraints,
} from "@/queries/releases"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as Releases from "@/components/releases"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import GoToButton from "@/components/go-to-button"
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleCard from "@/components/collapsible-card"
import { Separator } from "@/components/ui/separator"
import ConfirmationModal from "@/components/confirmation-modal"

const ReleaseChannelIcons: Record<ReleaseChannel, React.ReactNode> = {
  [ReleaseChannel.Stable]: <Package className="size-3" />,
  [ReleaseChannel.Rc]: <PackageOpen className="size-3" />,
  [ReleaseChannel.Beta]: <FlaskConical className="size-3" />,
  [ReleaseChannel.Alpha]: <TestTube className="size-3" />,
  [ReleaseChannel.Dev]: <Binary className="size-3" />,
}

const ReleaseStatusIcons: Record<ReleaseStatus, React.ReactNode> = {
  [ReleaseStatus.Draft]: <CircleDashed className="size-3" />,
  [ReleaseStatus.Published]: <CircleCheck className="size-3" />,
  [ReleaseStatus.Yanked]: <CircleOff className="size-3" />,
}

function ConstraintRow({ constraint }: { constraint: ReleaseConstraint }) {
  const entitlementId = constraint.relationships.entitlement?.data?.id || ""
  const { data: entitlement } = useGetEntitlement(entitlementId)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        {entitlement ? (
          <>
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
          </>
        ) : (
          <>
            <Skeleton className="h-5 w-32 rounded-sm" />
            <Skeleton className="h-5 w-24 rounded-sm" />
          </>
        )}
      </div>
    </div>
  )
}

function ArtifactRow({ artifact }: { artifact: Artifact }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <GoToButton
          path="/$accountId/app/artifacts/$id"
          params={{
            accountId: keygen.config.id,
            id: artifact.id,
          }}
          label={artifact.attributes.filename}
        />
      </div>
    </div>
  )
}

export default function ReleaseDetails() {
  const { id } = useParams({ from: "/$accountId/app/releases/$id" })
  const { data: release, isLoading, isFetching, isError } = useGetRelease(id)
  const deleteRelease = useRemoveRelease(id)
  const publishRelease = usePublishRelease(id)
  const yankRelease = useYankRelease(id)

  const productId = release?.relationships.product?.data?.id || ""
  const { data: product } = useGetProduct(productId)

  const packageId = release?.relationships.package?.data?.id || ""
  const { data: pkg } = useGetPackage(packageId)

  const {
    data: constraints = [],
    isLoading: constraintsLoading,
    isFetching: constraintsFetching,
    isError: constraintsError,
  } = useListReleaseConstraints(id)

  const {
    data: artifacts = [],
    isLoading: artifactsLoading,
    isFetching: artifactsFetching,
    isError: artifactsError,
  } = useListReleaseArtifacts(id)

  const back = useBackNavigate()

  const isMobile = useMobile()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    publish: false,
    yank: false,
    attributes: false,
  })

  useEffect(() => {
    ;(async () => {
      if (isError && !isFetching) {
        await back()
      }
    })()
  }, [isError, isFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteRelease = () => {
    deleteRelease.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Release deleted",
          variant: "success",
        })
        await back()
      },
    })
  }

  const handlePublishRelease = async () => {
    try {
      await publishRelease.mutateAsync()
      toast({ message: "Release published", variant: "success" })
      toggleOpen("publish", false)
    } catch {
      toast({ message: "Failed to publish release", variant: "error" })
    }
  }

  const handleYankRelease = async () => {
    try {
      await yankRelease.mutateAsync()
      toast({ message: "Release yanked", variant: "success" })
      toggleOpen("yank", false)
    } catch {
      toast({ message: "Failed to yank release", variant: "error" })
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
                  Releases
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {release ? (
                  <BreadcrumbPage>
                    {release.attributes.name ?? release.attributes.version}
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
                  disabled={isLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                {release?.attributes.status === ReleaseStatus.Draft && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("publish", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Publish
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {release?.attributes.status === ReleaseStatus.Published && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("yank", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Yank
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
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
              {release?.attributes.status === ReleaseStatus.Draft && (
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("publish", true)}
                >
                  Publish
                </Button>
              )}
              {release?.attributes.status === ReleaseStatus.Published && (
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("yank", true)}
                >
                  Yank
                </Button>
              )}
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => toggleOpen("edit", true)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => toggleOpen("delete", true)}
              >
                Delete
              </Button>
            </div>
          )}
        </PageHeader>

        {release ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="mb-2 flex flex-wrap gap-2">
                <TooltipBadge
                  icon={ReleaseChannelIcons[release.attributes.channel]}
                  value={ReleaseChannelLabels[release.attributes.channel]}
                  variant="secondary"
                  tooltip={
                    ReleaseChannelDescriptions[release.attributes.channel]
                  }
                  className="px-1 text-xs"
                />
                <TooltipBadge
                  icon={ReleaseStatusIcons[release.attributes.status]}
                  value={ReleaseStatusLabels[release.attributes.status]}
                  variant={ReleaseStatusVariants[release.attributes.status]}
                  tooltip={ReleaseStatusDescriptions[release.attributes.status]}
                  className="px-1 text-xs"
                />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {release.attributes.name ?? release.attributes.version}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(release.id)}
                  className="w-fit pb-0.5"
                >
                  {release.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>
              <div className="mt-2 flex items-center">
                <div className="flex h-4 items-center text-sm text-content-subdued">
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

                <Separator orientation="vertical" className="mx-4 h-4!" />

                <div className="flex h-4 items-center text-sm text-content-subdued">
                  <Package className="mr-2 size-4 pt-0.5" />
                  <span>Package:</span>
                  {pkg ? (
                    <GoToButton
                      path="/$accountId/app/packages/$id"
                      params={{
                        accountId: keygen.config.id,
                        id: pkg.id,
                      }}
                      label={pkg.attributes.name}
                      className="ml-3"
                    />
                  ) : (
                    <Skeleton className="mt-1 ml-3 h-6 w-48" />
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
                    <div className="space-y-4 md:pr-3">
                      <Attribute.Field
                        label="Version"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={release.attributes.version}
                            tooltip={ReleaseAttributeDescriptions.version}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Tag"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={release.attributes.tag}
                            tooltip={ReleaseAttributeDescriptions.tag}
                            emptyLabel="Not set"
                          />
                        }
                      />
                    </div>
                    <div className="mt-4 space-y-4 md:mt-0 md:pl-3">
                      <Attribute.Field
                        label="Backdated"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={
                              release.attributes.backdated
                                ? formatDate(
                                    new Date(release.attributes.backdated),
                                    "PPP",
                                  )
                                : null
                            }
                            tooltip={ReleaseAttributeDescriptions.backdated}
                          />
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Attribute.Field
                      label="Description"
                      variant="stacking"
                      tooltip={ReleaseAttributeDescriptions.description}
                      value={
                        <p className="max-w-full rounded border border-accent bg-background bg-none p-2 text-sm whitespace-pre-wrap text-content-muted">
                          {release.attributes.description ?? (
                            <span className="text-content-subdued">
                              Not set
                            </span>
                          )}
                        </p>
                      }
                    />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard
                  title="Constraints"
                  subtitle={
                    <Badge className="ml-2 min-h-5 min-w-5 text-sm text-content-muted">
                      {constraints.length}
                    </Badge>
                  }
                >
                  {constraintsError ? (
                    <Badge variant="destructive">ERROR</Badge>
                  ) : constraintsLoading || constraintsFetching ? (
                    <div className="flex w-full justify-between">
                      <Skeleton className="h-5 w-48 rounded-sm" />
                      <Skeleton className="h-5 w-24 rounded-sm" />
                    </div>
                  ) : constraints.length > 0 ? (
                    constraints.map((constraint) => (
                      <ConstraintRow
                        key={constraint.id}
                        constraint={constraint}
                      />
                    ))
                  ) : (
                    <Attribute.Field variant="text" label="None" value="--" />
                  )}
                </CollapsibleCard>

                <CollapsibleCard
                  title="Artifacts"
                  subtitle={
                    <Badge className="ml-2 min-h-5 min-w-5 text-sm text-content-muted">
                      {artifacts.length}
                    </Badge>
                  }
                >
                  {artifactsError ? (
                    <Badge variant="destructive">ERROR</Badge>
                  ) : artifactsLoading || artifactsFetching ? (
                    <div className="flex w-full justify-between">
                      <Skeleton className="h-5 w-48 rounded-sm" />
                      <Skeleton className="h-5 w-24 rounded-sm" />
                    </div>
                  ) : artifacts.length > 0 ? (
                    artifacts.map((artifact) => (
                      <ArtifactRow key={artifact.id} artifact={artifact} />
                    ))
                  ) : (
                    <Attribute.Field variant="text" label="None" value="--" />
                  )}
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={release} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard title="Properties" contentClass="space-y-2">
                    {release ? (
                      <>
                        <Property.Field
                          icon={SquarePlus}
                          label="Created at"
                          value={new Date(
                            release.attributes.created,
                          ).toLocaleDateString()}
                        />
                        <Property.Field
                          icon={SquarePen}
                          label="Updated at"
                          value={new Date(
                            release.attributes.updated,
                          ).toLocaleDateString()}
                        />
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
            <SidebarHeader className="border-b border-accent pt-8 pb-0">
              <TabsSwitch
                className="border-b border-accent pt-8 pb-0"
                options={[
                  { value: "overview", label: "Overview", icon: Menu },
                  { value: "events", label: "Events", icon: GitFork },
                ]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview" className="space-y-4 p-4">
                {release ? (
                  <>
                    <Property.Section title="Properties">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={new Date(
                          release.attributes.created,
                        ).toLocaleDateString()}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={new Date(
                          release.attributes.updated,
                        ).toLocaleDateString()}
                      />
                    </Property.Section>
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

      <Releases.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${release?.attributes.name ?? release?.attributes.version}`}
        description="Are you sure you want to delete this release?"
        open={open.delete}
        disabled={deleteRelease.isPending}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteRelease}
        label="Delete"
        variant="destructive"
      />

      <ConfirmationModal
        title={`Publish ${release?.attributes.name ?? release?.attributes.version}`}
        description="Are you sure you want to publish this release? Once published, it will be accessible to entitled users."
        open={open.publish}
        disabled={publishRelease.isPending}
        onClose={() => toggleOpen("publish", false)}
        onConfirm={handlePublishRelease}
        label="Publish"
        variant="default"
      />

      <ConfirmationModal
        title={`Yank ${release?.attributes.name ?? release?.attributes.version}`}
        description="Are you sure you want to yank this release? Yanked releases are delisted and no longer accessible to users."
        open={open.yank}
        disabled={yankRelease.isPending}
        onClose={() => toggleOpen("yank", false)}
        onConfirm={handleYankRelease}
        label="Yank"
        variant="destructive"
      />

      {release && (
        <Releases.AdvancedDialog
          id={release.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
