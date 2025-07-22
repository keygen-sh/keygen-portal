import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"

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

import { Product, DistributionStrategy } from "@/types/products"
import { useMobile } from "@/hooks/use-mobile"

import * as keygen from "@/keygen"
import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"
import * as Attribute from "@/components/attribute"
import * as Property from "@/components/property"
import * as Products from "@/components/products"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import DeleteModal from "@/components/delete-modal"
import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"

export default function ProductDetails() {
  const { productId } = useParams({ from: "/$id/app/products/$productId" })
  const navigate = useNavigate()
  const isMobile = useMobile()

  const [product, setProduct] = useState<Product | null>(null)
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await keygen.products.get({ id: productId })

        if (data) {
          setProduct(data)
        } else {
          throw new Error(`Product with ID ${productId} not found`)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          message: "Could not find product",
          variant: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [])

  const handleDeleteProduct = useCallback(
    async (id: string) => {
      setLoading(true)

      try {
        await keygen.products.remove({ id })
      } catch (error) {
        console.error("Error deleting product:", error)
        toast({
          message: "Failed to delete product",
          variant: "error",
        })
      } finally {
        setProduct(null)
        navigate({ to: `..` })
        toast({
          message: "Product deleted",
          variant: "success",
        })
        setLoading(false)
      }
    },
    [loading],
  )

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
                  disabled={loading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                <DropdownMenuItem
                  onClick={() => {
                    setTimeout(() => {
                      setOpen({ ...open, edit: true })
                    }, 0)
                  }}
                  className="pb-2 text-base"
                >
                  Edit
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem
                  onClick={() => {
                    setTimeout(() => {
                      setOpen({ ...open, delete: true })
                    }, 0)
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
                disabled={loading}
                onClick={() => setOpen({ ...open, edit: true })}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => setOpen({ ...open, delete: true })}
              >
                Delete
              </Button>
            </div>
          )}
        </PageHeader>

        {product ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton path=".." className="mb-8" />
              <div className="mb-2">
                {product.attributes.distributionStrategy ===
                DistributionStrategy.LICENSED ? (
                  <Badge variant="secondary">
                    <Award className="inline size-4" />
                    Licensed
                  </Badge>
                ) : product.attributes.distributionStrategy ===
                  DistributionStrategy.CLOSED ? (
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
                        value={product.attributes.url || "--"}
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
                    {product.attributes.permissions?.length > 0 ? (
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

                <CollapsibleCard title="Relationships">
                  <Attribute.Field variant="text" label="Tokens" value={"--"} />
                </CollapsibleCard>

                <CollapsibleCard title="Metadata">
                  {product.attributes.metadata &&
                  Object.keys(product.attributes.metadata).length > 0 ? (
                    <div className="flex flex-col space-y-2">
                      {Object.entries(product.attributes.metadata).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-sm text-content-normal">
                              {key}:
                            </span>
                            <span className="text-sm text-content-muted">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-content-muted">{"{ }"}</p>
                  )}
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard title="Properties" className="space-y-2">
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
                    <p className="text-sm text-content-subdued">
                      Nothing here yet.
                    </p>
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
              <TabsContent value="overview" className="p-4">
                <Property.Section title="Properties">
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
                </Property.Section>
              </TabsContent>

              <TabsContent value="events" className="p-4"></TabsContent>
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
          </Sidebar>
        </Tabs>
      )}

      <Products.Edit.Modal
        open={open.edit}
        onClose={() => setOpen({ ...open, edit: false })}
        product={product}
      />

      <DeleteModal
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the product and delete all associated policy, license and machine resources."
        open={open.delete}
        disabled={loading}
        onClose={() => setOpen({ ...open, delete: false })}
        onDelete={() => handleDeleteProduct(productId)}
      />
    </section>
  )
}
