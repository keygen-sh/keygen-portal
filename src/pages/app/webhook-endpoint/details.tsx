import { useEffect, useState } from "react"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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
} from "@/components/ui/dropdown-menu"

import {
  Copy,
  Logs,
  Menu,
  SquarePen,
  SquarePlus,
  EllipsisVertical,
} from "lucide-react"

import { useGetProduct } from "@/queries/products"
import {
  useGetWebhookEndpoint,
  useRemoveWebhookEndpoint,
} from "@/queries/webhook-endpoints"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { truncator } from "@/lib/truncate"
import { copyToClipboard } from "@/lib/clipboard"

import { SigningAlgorithmLabels } from "@/types/files"
import { WebhookEndpointAttributeDescriptions } from "@/types/webhook-endpoints"

import * as keygen from "@/keygen"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as WebhookEndpoints from "@/components/webhook-endpoints"
import Can from "@/components/can"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import GoToButton from "@/components/go-to-button"
import ResourceLink from "@/components/resource-link"
import ConfirmationModal from "@/components/confirmation-modal"
import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"

export default function WebhookEndpointDetails() {
  const { id } = useParams({ from: "/$accountId/app/webhook-endpoints/$id" })
  const {
    data: webhookEndpoint,
    isLoading,
    isFetching,
    isError,
  } = useGetWebhookEndpoint(id)
  const removeWebhookEndpoint = useRemoveWebhookEndpoint(id)

  const productId = webhookEndpoint?.relationships.product?.data?.id || ""
  const {
    data: product,
    isLoading: productLoading,
    isFetching: productFetching,
    isError: productError,
  } = useGetProduct(productId)

  const environment = webhookEndpoint?.relationships.environment?.data

  const back = useBackNavigate()
  const isMobile = useMobile()
  const truncateUrl = truncator("middle", { maxLength: isMobile ? 16 : 32 })
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

  const handleDeleteWebhookEndpoint = () => {
    removeWebhookEndpoint.mutate(undefined, {
      onSuccess: async () => {
        toast({ message: "Webhook endpoint deleted", variant: "success" })
        await back()
      },
    })
  }

  const subscriptions = webhookEndpoint?.attributes.subscriptions ?? []
  const isAllEvents = subscriptions.length === 1 && subscriptions[0] === "*"

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
                  Webhook Endpoints
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {webhookEndpoint ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto md:max-w-md">
                    {webhookEndpoint.attributes.url}
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
                <Can permission="webhook-endpoint.update">
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
                <Can permission="webhook-endpoint.delete">
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("delete", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Can permission="webhook-endpoint.update">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="webhook-endpoint.delete">
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

        {webhookEndpoint ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(webhookEndpoint.id)}
                  className="w-fit"
                >
                  {webhookEndpoint.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
                    <div className="space-y-4 md:pr-3">
                      <Attribute.Field
                        label="URL"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={webhookEndpoint.attributes.url}
                            tooltip={WebhookEndpointAttributeDescriptions.url}
                            className="break-all"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Signature algorithm"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={
                              SigningAlgorithmLabels[
                                webhookEndpoint.attributes.signatureAlgorithm
                              ]
                            }
                            tooltip={
                              WebhookEndpointAttributeDescriptions.signatureAlgorithm
                            }
                          />
                        }
                      />
                    </div>
                    <div className="mt-4 space-y-4 md:mt-0 md:pl-3">
                      <Attribute.Field
                        label="API version"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={webhookEndpoint.attributes.apiVersion}
                            tooltip={
                              WebhookEndpointAttributeDescriptions.apiVersion
                            }
                          />
                        }
                      />
                    </div>
                  </div>

                  <CollapsibleMenu
                    title="Subscriptions"
                    subtitle={
                      <Badge className="ml-2 min-h-5 min-w-5 text-sm text-content-muted">
                        {isAllEvents ? "*" : subscriptions.length}
                      </Badge>
                    }
                    titleClassName="text-sm text-content-normal"
                  >
                    {isAllEvents ? (
                      <Badge variant="secondary">
                        Subscribed to all events
                      </Badge>
                    ) : subscriptions.length > 0 ? (
                      <div className="flex max-w-full flex-wrap gap-2">
                        {subscriptions.map((subscription) => (
                          <Badge key={subscription} variant="secondary">
                            {subscription}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Attribute.Field variant="text" label="None" value="--" />
                    )}
                  </CollapsibleMenu>
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <div className="grid gap-4">
                    <Attribute.Field
                      variant="text"
                      label="Environment"
                      value={
                        <ResourceLink
                          linkage={environment}
                          emptyLabel="Global"
                        />
                      }
                    />
                    <Attribute.Field
                      variant="text"
                      label="Product"
                      value={
                        productError ? (
                          <Badge variant="destructive">ERROR</Badge>
                        ) : productId && (productLoading || productFetching) ? (
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

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    <CollapsibleMenu title="Properties" className="space-y-2">
                      <Attribute.Field
                        label="Created at"
                        value={formatDate(
                          new Date(String(webhookEndpoint.attributes.created)),
                          "PP",
                        )}
                      />
                      <Attribute.Field
                        label="Updated at"
                        value={formatDate(
                          new Date(String(webhookEndpoint.attributes.updated)),
                          "PP",
                        )}
                      />
                    </CollapsibleMenu>
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
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        )}
      </div>

      {!isMobile && (
        <Tabs defaultValue="overview">
          <Sidebar className="w-64 shrink-0" side="right">
            <SidebarHeader className="min-h-[70px] justify-end p-0">
              <TabsSwitch
                options={[{ value: "overview", label: "Overview", icon: Menu }]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview">
                {webhookEndpoint ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(webhookEndpoint.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(webhookEndpoint.attributes.updated)),
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

      <WebhookEndpoints.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      {webhookEndpoint && (
        <ConfirmationModal
          title={`Delete ${truncateUrl(webhookEndpoint.attributes.url)}`}
          description="Are you sure you want to delete this webhook endpoint? This action cannot be undone."
          open={open.delete}
          disabled={isLoading || removeWebhookEndpoint.isPending}
          onClose={() => toggleOpen("delete", false)}
          onConfirm={handleDeleteWebhookEndpoint}
          label="Delete"
          variant="destructive"
          confirmText="delete webhook endpoint"
        />
      )}

      {webhookEndpoint && (
        <WebhookEndpoints.AdvancedDialog
          id={webhookEndpoint.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
