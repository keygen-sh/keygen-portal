import { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"

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
  Lock,
  Unlock,
  Award,
  SquarePlus,
  SquarePen,
  EllipsisVertical,
} from "lucide-react"

import { DistributionStrategy } from "@/types/products"

import { useGetProduct, useRemoveProduct } from "@/queries/products"
import { useMobile } from "@/hooks/use-mobile"
import { useSidebarTab } from "@/hooks/use-sidebar-tab"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as Products from "@/components/products"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as EventLogs from "@/components/event-logs"
import Can from "@/components/can"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import ConfirmationModal from "@/components/confirmation-modal"
import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"

export default function ProductDetails() {
  const { id } = useParams({ from: "/$accountId/app/products/$id" })
  const { data: product, isLoading, isFetching, isError } = useGetProduct(id)
  const deleteProduct = useRemoveProduct(id)

  const back = useBackNavigate()

  const isMobile = useMobile()
  const [tab, setTab] = useSidebarTab()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
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

  const handleDeleteProduct = () => {
    deleteProduct.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Product deleted",
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
                  Products
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {product ? (
                  <BreadcrumbPage>{product.attributes.name}</BreadcrumbPage>
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
                <Can permission="product.update">
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
                <Can permission="product.delete">
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
              <Can permission="product.update">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="product.delete">
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

        {product ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />
              <div className="mb-2">
                {product.attributes.distributionStrategy ===
                DistributionStrategy.Licensed ? (
                  <Badge variant="secondary">
                    <Award className="inline size-4" />
                    Licensed
                  </Badge>
                ) : product.attributes.distributionStrategy ===
                  DistributionStrategy.Closed ? (
                  <Badge variant="secondary">
                    <Lock className="inline size-4" />
                    Closed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Unlock className="inline size-4" />
                    Open
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {product.attributes.name}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(product.id)}
                  className="w-fit pb-0.5"
                >
                  {product.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        variant="outline"
                        label="Code"
                        value={product.attributes.code}
                      />
                      <Attribute.Field
                        variant="text"
                        label="URL"
                        value={
                          product.attributes.url || (
                            <Badge variant="disabled">Not set</Badge>
                          )
                        }
                      />
                    </div>
                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <Attribute.Field
                          label="Distribution Strategy"
                          value={product.attributes.distributionStrategy}
                          tooltip={`The distribution strategy for releases.
                                    Licensed = only licensed users.
                                    Open = anybody, no license required.
                                    Closed = only admins.`}
                        />
                      </div>
                      <Attribute.Array
                        label="Platforms"
                        array={product.attributes.platforms || []}
                      />
                    </div>
                  </div>
                  <CollapsibleMenu title="Permissions" defaultOpen={false}>
                    {product.attributes.permissions != null &&
                    product.attributes.permissions.length > 0 ? (
                      <div className="flex max-w-full flex-wrap gap-2">
                        {product.attributes.permissions.map(
                          (permission, index) => (
                            <Badge
                              key={index}
                              className="text-sm text-content-muted"
                            >
                              {permission}
                            </Badge>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-content-muted">
                        No permissions defined.
                      </p>
                    )}
                  </CollapsibleMenu>
                </CollapsibleCard>

                <CollapsibleCard title="Relationships" defaultOpen={false}>
                  <Attribute.Field variant="text" label="TODO" value={"--"} />
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={product} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard title="Properties" contentClass="space-y-2">
                    {product ? (
                      <>
                        <Property.Field
                          icon={SquarePlus}
                          label="Created at"
                          value={new Date(
                            product.attributes.created,
                          ).toLocaleDateString()}
                        />
                        <Property.Field
                          icon={SquarePen}
                          label="Updated at"
                          value={new Date(
                            product.attributes.updated,
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
                      filters={{ resource: { type: "product", id } }}
                    />
                  </CollapsibleCard>
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
              <TabsContent value="overview" className="space-y-4 p-4">
                {product ? (
                  <>
                    <Property.Section title="Properties">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={new Date(
                          product.attributes.created,
                        ).toLocaleDateString()}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={new Date(
                          product.attributes.updated,
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
                  filters={{ resource: { type: "product", id } }}
                />
              </TabsContent>
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
          </Sidebar>
        </Tabs>
      )}

      <Products.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${product?.attributes.name}`}
        description="Are you sure you want to delete this product?"
        open={open.delete}
        disabled={deleteProduct.isPending}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteProduct}
        label="Delete"
        variant="destructive"
        confirmText={product?.attributes.name || "delete product"}
      />
    </section>
  )
}
