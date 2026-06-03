import { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
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
  GitFork,
  SquarePen,
  SquarePlus,
  EllipsisVertical,
} from "lucide-react"

import {
  PackageAttributeDescriptions,
  PackageEngineLabels,
} from "@/types/packages"

import * as keygen from "@/keygen"

import { useGetProduct } from "@/queries/products"
import { useGetPackage, useRemovePackage } from "@/queries/packages"

import { useMobile } from "@/hooks/use-mobile"
import { useSidebarTab } from "@/hooks/use-sidebar-tab"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as Packages from "@/components/packages"
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
import CollapsibleCard from "@/components/collapsible-card"

export default function PackageDetails() {
  const { id } = useParams({ from: "/$accountId/app/packages/$id" })
  const { data: pkg, isLoading, isFetching, isError } = useGetPackage(id)
  const deletePackage = useRemovePackage(id)

  const productId = pkg?.relationships.product?.data?.id || ""
  const { data: product } = useGetProduct(productId)

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
      if (isError && !isFetching) {
        await back()
      }
    })()
  }, [isError, isFetching, back])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeletePackage = () => {
    deletePackage.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Package deleted",
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
                  Packages
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {pkg ? (
                  <BreadcrumbPage>
                    {pkg.attributes.name ?? pkg.attributes.key}
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
                <Can permission="package.update">
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
                <Can permission="package.delete">
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
              <Can permission="package.update">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="package.delete">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {pkg ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {pkg.attributes.name ?? pkg.attributes.key}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(pkg.id)}
                  className="w-fit pb-0.5"
                >
                  {pkg.id}
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
                <CollapsibleCard title="Attributes">
                  <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
                    <div className="space-y-4 md:pr-3">
                      <Attribute.Field
                        label="Key"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={pkg.attributes.key}
                            tooltip={PackageAttributeDescriptions.key}
                          />
                        }
                      />
                    </div>
                    <div className="mt-4 space-y-4 md:mt-0 md:pl-3">
                      <Attribute.Field
                        label="Engine"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={
                              pkg.attributes.engine
                                ? PackageEngineLabels[pkg.attributes.engine]
                                : null
                            }
                            tooltip={PackageAttributeDescriptions.engine}
                            emptyLabel="Not set"
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={pkg} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard title="Properties" contentClass="space-y-2">
                    {pkg ? (
                      <>
                        <Property.Field
                          icon={SquarePlus}
                          label="Created at"
                          value={new Date(
                            pkg.attributes.created,
                          ).toLocaleDateString()}
                        />
                        <Property.Field
                          icon={SquarePen}
                          label="Updated at"
                          value={new Date(
                            pkg.attributes.updated,
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
                    <EventLogs.Feed
                      compact
                      filters={{ resource: { type: "package", id } }}
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
                {pkg ? (
                  <>
                    <Property.Section title="Properties">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={new Date(
                          pkg.attributes.created,
                        ).toLocaleDateString()}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={new Date(
                          pkg.attributes.updated,
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

              <TabsContent
                value="events"
                className="flex min-h-0 flex-1 flex-col p-0"
              >
                <EventLogs.Feed
                  compact
                  filters={{ resource: { type: "package", id } }}
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

      <Packages.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${pkg?.attributes.name ?? pkg?.attributes.key}`}
        description="Are you sure you want to delete this package? This will also immediately delete any releases and artifacts."
        open={open.delete}
        disabled={deletePackage.isPending}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeletePackage}
        label="Delete"
        variant="destructive"
        confirmText={pkg?.attributes.name || "delete package"}
      />

      {pkg && (
        <Packages.AdvancedDialog
          id={pkg.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
