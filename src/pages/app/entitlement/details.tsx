import { useState, useEffect } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

import { Button } from "@/components/ui/button"
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
} from "lucide-react"

import { useGetEntitlement, useRemoveEntitlement } from "@/queries/entitlements"
import { useMobile } from "@/hooks/use-mobile"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as Entitlements from "@/components/entitlements"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import DeleteModal from "@/components/delete-modal"
import CollapsibleCard from "@/components/collapsible-card"

export default function EntitlementDetails() {
  const { entitlementId } = useParams({
    from: "/$id/app/entitlements/$entitlementId",
  })
  const {
    data: entitlement,
    isLoading: entitlementLoading,
    isFetching: entitlementFetching,
    isError: entitlementError,
  } = useGetEntitlement(entitlementId)

  const deleteEntitlement = useRemoveEntitlement(entitlementId)

  const navigate = useNavigate()

  const isMobile = useMobile()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
  })

  useEffect(() => {
    ;(async () => {
      if (entitlementError && !entitlementFetching) {
        await navigate({ to: ".." })
      }
    })()
  }, [entitlementError, entitlementFetching, navigate])

  const handleOpen = (key: keyof typeof open) => {
    setOpen({
      edit: false,
      delete: false,
      [key]: !open[key],
    })
  }

  const handleDeleteEntitlement = () => {
    if (!entitlement) return

    deleteEntitlement.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Entitlement deleted",
          variant: "success",
        })
        await navigate({ to: ".." })
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
                  onClick={() => navigate({ to: `..` })}
                >
                  Entitlements
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {entitlement ? (
                  <BreadcrumbPage>{entitlement.attributes.name}</BreadcrumbPage>
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
                  disabled={entitlementLoading}
                  className="text-content-muted"
                >
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-4 p-0">
                <DropdownMenuItem
                  onClick={() => {
                    setTimeout(() => {
                      handleOpen("edit")
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
                      handleOpen("delete")
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
                disabled={entitlementLoading}
                onClick={() => handleOpen("edit")}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                disabled={entitlementLoading}
                onClick={() => handleOpen("delete")}
              >
                Delete
              </Button>
            </div>
          )}
        </PageHeader>

        {entitlement ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton path=".." className="mb-8" />

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {entitlement.attributes.name}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(entitlement.id)}
                  className="w-fit pb-0.5"
                >
                  {entitlement.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Attributes">
                  <Attribute.Field
                    variant="outline"
                    label="Code"
                    value={entitlement.attributes.code}
                  />
                </CollapsibleCard>

                <CollapsibleCard title="Metadata">
                  {entitlement.attributes.metadata &&
                  Object.keys(entitlement.attributes.metadata).length > 0 ? (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(
                              entitlement.attributes.metadata,
                              null,
                              2,
                            ),
                          )
                        }
                        className="absolute top-3 right-3 z-10 h-7 w-7"
                      >
                        <Copy className="size-3.5" />
                      </Button>

                      <ScrollArea className="max-h-64 rounded border border-accent">
                        <pre className="p-3 font-mono text-sm leading-snug">
                          {JSON.stringify(
                            entitlement.attributes.metadata,
                            null,
                            2,
                          )}
                        </pre>
                      </ScrollArea>
                    </div>
                  ) : (
                    <p className="text-sm text-content-muted">{"{ }"}</p>
                  )}
                </CollapsibleCard>
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
                {entitlement ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(entitlement.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(entitlement.attributes.updated)),
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

              <TabsContent value="events" className="p-4"></TabsContent>
            </SidebarContent>
            <SidebarFooter className="p-4"></SidebarFooter>
          </Sidebar>
        </Tabs>
      )}

      <Entitlements.Edit.Modal
        open={open.edit}
        onClose={() => setOpen({ ...open, edit: false })}
        entitlement={entitlement!}
      />

      <DeleteModal
        title={`Delete ${entitlement?.attributes.name}`}
        description="Are you sure you want to delete this entitlement?"
        open={open.delete}
        disabled={entitlementLoading}
        onClose={() => handleOpen("delete")}
        onDelete={handleDeleteEntitlement}
      />
    </section>
  )
}
