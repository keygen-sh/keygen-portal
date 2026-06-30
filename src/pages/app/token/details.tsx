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
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  Copy,
  Menu,
  Logs,
  GitFork,
  SquarePen,
  SquarePlus,
  TriangleAlert,
} from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"
import { useSidebarTab } from "@/hooks/use-sidebar-tab"
import { useBackNavigate } from "@/hooks/use-back-navigate"
import {
  useGetToken,
  useRevokeToken,
  useRegenerateToken,
} from "@/queries/tokens"

import {
  TokenKindLabels,
  TokenKindDescriptions,
  TokenAttributeDescriptions,
} from "@/types/tokens"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"
import { revokeTokenDescription } from "@/lib/tokens"

import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as EventLogs from "@/components/event-logs"
import * as Tokens from "@/components/tokens"
import Can from "@/components/can"
import PageHeader from "@/components/page-header"
import BackButton from "@/components/back-button"
import TabsSwitch from "@/components/tabs-switch"
import TooltipBadge from "@/components/tooltip-badge"
import ResourceLink from "@/components/resource-link"
import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"
import ConfirmationModal from "@/components/confirmation-modal"

export default function TokenDetails() {
  const { id } = useParams({ from: "/$accountId/app/tokens/$id" })
  const { data: token, isLoading, isFetching, isError } = useGetToken(id)
  const revokeToken = useRevokeToken()
  const regenerateToken = useRegenerateToken()

  const back = useBackNavigate()
  const isMobile = useMobile()
  const [tab, setTab] = useSidebarTab()

  const [open, setOpen] = useState({
    revoke: false,
    regenerate: false,
    attributes: false,
  })
  const [secret, setSecret] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      if (isError && !isFetching) {
        await back()
      }
    })()
  }, [isError, isFetching, back])

  const handleRevoke = () => {
    revokeToken.mutate(
      { id },
      {
        onSuccess: async () => {
          toast({ message: "Token revoked", variant: "success" })
          await back()
        },
        onError: () => {
          toast({ message: "Failed to revoke token", variant: "error" })
        },
      },
    )
  }

  const handleRegenerate = () => {
    regenerateToken.mutate(
      { id },
      {
        onSuccess: (regenerated) => {
          toast({ message: "Token regenerated", variant: "success" })
          setOpen((prev) => ({ ...prev, regenerate: false }))
          setSecret(regenerated.attributes.token ?? null)
        },
        onError: () => {
          toast({ message: "Failed to regenerate token", variant: "error" })
        },
      },
    )
  }

  const properties = token ? (
    <>
      <Property.Field
        icon={SquarePlus}
        label="Created at"
        value={formatDate(new Date(String(token.attributes.created)), "PP")}
      />
      <Property.Field
        icon={SquarePen}
        label="Updated at"
        value={formatDate(new Date(String(token.attributes.updated)), "PP")}
      />
    </>
  ) : (
    <div className="flex flex-col space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
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
                  onClick={() => back()}
                >
                  Tokens
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {token ? (
                  <BreadcrumbPage>
                    {token.attributes.name || token.id}
                  </BreadcrumbPage>
                ) : (
                  <Skeleton className="h-6 w-32" />
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <Can permission="token.regenerate">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() =>
                  setOpen((prev) => ({ ...prev, regenerate: true }))
                }
              >
                Regenerate
              </Button>
            </Can>
            <Can permission="token.revoke">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => setOpen((prev) => ({ ...prev, revoke: true }))}
              >
                Revoke
              </Button>
            </Can>
          </div>
        </PageHeader>

        {token ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              {token.attributes.kind === "admin-token" && (
                <div className="mb-6 flex items-start gap-2 rounded-md bg-warning/20 p-3 text-sm text-pretty text-warning">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p className="flex flex-col text-xs">
                    <strong>
                      Admin tokens should be used sparingly for API
                      integrations.
                    </strong>
                    <span className="text-pretty">
                      Admin tokens are automatically revoked when the admin's
                      password is changed, when its second factors are changed,
                      or when the admin's role or permissions are changed. As
                      such, we <strong>DO NOT</strong> recommend using admin
                      tokens for API integrations. Doing so could cause your API
                      integration to break unexpectedly.
                    </span>
                  </p>
                </div>
              )}

              <div className="mb-2">
                <TooltipBadge
                  variant="secondary"
                  value={TokenKindLabels[token.attributes.kind]}
                  tooltip={TokenKindDescriptions[token.attributes.kind]}
                  className="px-1 text-xs"
                />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {token.attributes.name || (
                    <span className="flex items-center text-lg font-normal text-content-disabled">
                      {"(name not set)"}
                    </span>
                  )}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(token.id)}
                  className="w-fit pb-0.5"
                >
                  {token.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        variant="none"
                        label="Subtype"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={token.attributes.kind}
                            tooltip="The kind of token, derived from its bearer (e.g. admin-token, user-token)."
                          />
                        }
                      />
                      {token.attributes.activations != null && (
                        <>
                          <Attribute.Field
                            variant="none"
                            label="Activations"
                            value={
                              <Attribute.Value
                                type="raw"
                                value={String(token.attributes.activations)}
                                tooltip={TokenAttributeDescriptions.activations}
                              />
                            }
                          />
                          <Attribute.Field
                            variant="none"
                            label="Deactivations"
                            value={
                              <Attribute.Value
                                type="raw"
                                value={String(
                                  token.attributes.deactivations ?? 0,
                                )}
                                tooltip={
                                  TokenAttributeDescriptions.deactivations
                                }
                              />
                            }
                          />
                        </>
                      )}
                    </div>
                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        variant="none"
                        label="Expiry"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={
                              token.attributes.expiry
                                ? formatDate(
                                    new Date(token.attributes.expiry),
                                    "PP",
                                  )
                                : null
                            }
                            emptyLabel="Never"
                            tooltip={TokenAttributeDescriptions.expiry}
                          />
                        }
                      />
                      {token.attributes.activations != null && (
                        <>
                          <Attribute.Field
                            variant="none"
                            label="Max activations"
                            value={
                              <Attribute.Value
                                type="raw"
                                value={
                                  token.attributes.maxActivations != null
                                    ? String(token.attributes.maxActivations)
                                    : null
                                }
                                emptyLabel="Unlimited"
                                tooltip={
                                  TokenAttributeDescriptions.maxActivations
                                }
                              />
                            }
                          />
                          <Attribute.Field
                            variant="none"
                            label="Max deactivations"
                            value={
                              <Attribute.Value
                                type="raw"
                                value={
                                  token.attributes.maxDeactivations != null
                                    ? String(token.attributes.maxDeactivations)
                                    : null
                                }
                                emptyLabel="Unlimited"
                                tooltip={
                                  TokenAttributeDescriptions.maxDeactivations
                                }
                              />
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <CollapsibleMenu title="Permissions" defaultOpen={false}>
                    {token.attributes.permissions != null &&
                    token.attributes.permissions.length > 0 ? (
                      <div className="flex max-w-full flex-wrap gap-2">
                        {token.attributes.permissions.map(
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
                  <div className="grid gap-4">
                    <Attribute.Field
                      variant="text"
                      label="Bearer"
                      value={
                        <ResourceLink
                          linkage={token.relationships.bearer?.data}
                        />
                      }
                    />
                    <Attribute.Field
                      variant="text"
                      label="Environment"
                      value={
                        <ResourceLink
                          linkage={token.relationships.environment?.data}
                          emptyLabel="Global"
                        />
                      }
                    />
                  </div>
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard title="Properties" contentClass="space-y-2">
                    {properties}
                  </CollapsibleCard>
                )}

                {isMobile && (
                  <CollapsibleCard title="Events">
                    <EventLogs.Feed
                      compact
                      filters={{ resource: { type: "token", id } }}
                    />
                  </CollapsibleCard>
                )}

                {isMobile && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setOpen((prev) => ({ ...prev, attributes: true }))
                    }
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
            <div className="mb-8 flex items-center gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-4">
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
                <Property.Section title="Properties">
                  {properties}
                </Property.Section>
              </TabsContent>

              <TabsContent
                value="events"
                className="flex min-h-0 flex-1 flex-col p-0"
              >
                <EventLogs.Feed
                  compact
                  filters={{ resource: { type: "token", id } }}
                />
              </TabsContent>
            </SidebarContent>
            <SidebarFooter className="p-4">
              <Button
                variant="outline"
                onClick={() =>
                  setOpen((prev) => ({ ...prev, attributes: true }))
                }
                className="w-full text-content-muted"
              >
                <Logs className="mt-0.5 size-4 text-content-normal" />
                View All Attributes
              </Button>
            </SidebarFooter>
          </Sidebar>
        </Tabs>
      )}

      <ConfirmationModal
        open={open.revoke}
        title="Revoke token"
        description={revokeTokenDescription(token)}
        label="Revoke"
        variant="destructive"
        disabled={revokeToken.isPending}
        onClose={() => setOpen((prev) => ({ ...prev, revoke: false }))}
        onConfirm={handleRevoke}
      />

      <ConfirmationModal
        open={open.regenerate}
        title="Regenerate token"
        description="This generates a new token value and immediately invalidates the current one. Any integration using the current value will stop working until it's updated."
        label="Regenerate"
        variant="destructive"
        disabled={regenerateToken.isPending}
        onClose={() => setOpen((prev) => ({ ...prev, regenerate: false }))}
        onConfirm={handleRegenerate}
      />

      <Tokens.Dialog.Secret secret={secret} onClose={() => setSecret(null)} />

      {token && (
        <Tokens.Dialog.Advanced
          id={token.id}
          open={open.attributes}
          onOpenChange={(value) =>
            setOpen((prev) => ({ ...prev, attributes: value }))
          }
        />
      )}
    </section>
  )
}
