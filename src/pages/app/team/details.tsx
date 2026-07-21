import { useState } from "react"
import { useParams, notFound } from "@tanstack/react-router"

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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
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
  Logs,
  Menu,
  GitFork,
  SquarePen,
  SquarePlus,
  CircleCheck,
  CirclePause,
  EllipsisVertical,
} from "lucide-react"

import {
  UserAttributeDescriptions,
  UserStatus,
  UserStatusLabels,
  UserStatusVariants,
  UserStatusDescriptions,
  UserRoleLabels,
} from "@/types/users"

import { useGetUser, useRemoveUser, useForgotPassword } from "@/queries/users"

import { useMobile } from "@/hooks/use-mobile"
import { useSidebarTab } from "@/hooks/use-sidebar-tab"
import { useBackNavigate } from "@/hooks/use-back-navigate"
import { useBreadcrumbBackNavigate } from "@/hooks/use-breadcrumb-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as keygen from "@/keygen"
import * as Users from "@/components/users"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import * as EventLogs from "@/components/event-logs"
import Can from "@/components/can"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import TooltipBadge from "@/components/tooltip-badge"
import ResourceLink from "@/components/resource-link"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"
import ConfirmationModal from "@/components/confirmation-modal"
import DocumentTitle from "@/components/document-title"

const UserStatusIcons: Partial<Record<UserStatus, React.ReactNode>> = {
  [UserStatus.Active]: <CircleCheck className="size-3" />,
  [UserStatus.Inactive]: <CirclePause className="size-3" />,
}

export default function TeamDetails() {
  const { id } = useParams({ from: "/$accountId/app/team/$id" })
  const {
    data: user,
    isLoading: userLoading,
    isFetching: userFetching,
    isError: userError,
  } = useGetUser(id)

  const deleteUser = useRemoveUser(id)
  const resetPassword = useForgotPassword()
  const back = useBackNavigate()
  const breadcrumbBack = useBreadcrumbBackNavigate()

  const isMobile = useMobile()
  const [tab, setTab] = useSidebarTab()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    attributes: false,
    resetPassword: false,
  })

  if (userError && !userFetching) {
    notFound({ throw: true })
  }

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteUser = () => {
    deleteUser.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "User deleted",
          variant: "success",
        })

        await back()
      },
    })
  }

  const handleResetPassword = async () => {
    if (!user?.attributes.email) return

    try {
      await resetPassword.mutateAsync({ email: user.attributes.email })
      toast({ message: "Password reset instructions sent", variant: "success" })
      toggleOpen("resetPassword", false)
    } catch {
      toast({ message: "Failed to send reset instructions", variant: "error" })
    }
  }

  return (
    <section className="flex h-screen w-full">
      <DocumentTitle
        title={`Team member: ${user?.attributes.fullName || user?.attributes.email || id}`}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <PageHeader>
          <Breadcrumb className="flex-1">
            <BreadcrumbList className="text-base">
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => breadcrumbBack()}
                >
                  Team
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {user ? (
                  <BreadcrumbPage className="w-40 truncate md:w-auto">
                    {user?.attributes.fullName || user?.attributes.email}
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
                "user.password.reset",
                "user.update",
                "user.delete",
              ]}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled={userLoading}
                    className="text-content-muted"
                  >
                    <EllipsisVertical className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-4 p-0">
                  <Can permission="user.password.reset">
                    <DropdownMenuItem
                      onClick={(e) => {
                        toggleOpen("resetPassword", true)
                        e.currentTarget.blur()
                      }}
                      className="pb-2 text-base"
                    >
                      Reset password
                    </DropdownMenuItem>
                    <Separator />
                  </Can>
                  <Can permission="user.update">
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
                  <Can permission="user.delete">
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
            </Can.Any>
          ) : (
            <div className="flex items-center space-x-2">
              <Can permission="user.password.reset">
                <Button
                  variant="outline"
                  disabled={userLoading}
                  onClick={() => {
                    toggleOpen("resetPassword", true)
                  }}
                >
                  Reset password
                </Button>
              </Can>
              <Can permission="user.update">
                <Button
                  variant="outline"
                  disabled={userLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="user.delete">
                <Button
                  variant="outline"
                  disabled={userLoading}
                  onClick={() => toggleOpen("delete", true)}
                >
                  Delete
                </Button>
              </Can>
            </div>
          )}
        </PageHeader>

        {user ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="flex flex-wrap items-center gap-1">
                <TooltipBadge
                  icon={UserStatusIcons[user.attributes.status]}
                  value={UserStatusLabels[user.attributes.status]}
                  variant={UserStatusVariants[user.attributes.status]}
                  tooltip={UserStatusDescriptions[user.attributes.status]}
                  className="px-1 text-xs"
                />
              </div>

              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {user?.attributes.fullName || user?.attributes.email}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(user.id)}
                  className="w-fit pb-0.5"
                >
                  {user.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-6 md:mt-8">
                <CollapsibleCard title="Profile">
                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Email"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="raw"
                            value={user.attributes.email}
                            tooltip={UserAttributeDescriptions.email}
                          />
                        }
                      />
                      <Attribute.Field
                        label="First Name"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={user.attributes.firstName}
                            tooltip={UserAttributeDescriptions.firstName}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Last Name"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={user.attributes.lastName}
                            tooltip={UserAttributeDescriptions.lastName}
                          />
                        }
                      />
                    </div>

                    <div className="mx-4 hidden md:block">
                      <Separator orientation="vertical" dashed={true} />
                    </div>

                    <div className="flex-1 space-y-4">
                      <Attribute.Field
                        label="Role"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={UserRoleLabels[user.attributes.role]}
                            tooltip={UserAttributeDescriptions.role}
                          />
                        }
                      />
                    </div>
                  </div>
                  {!keygen.config.isCE && (
                    <CollapsibleMenu title="Permissions" defaultOpen={false}>
                      {user.attributes.permissions != null &&
                      user.attributes.permissions.length > 0 ? (
                        <div className="flex max-w-full flex-wrap gap-2">
                          {user.attributes.permissions.map(
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
                  )}
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <div className="grid gap-4">
                    <Attribute.Field
                      variant="text"
                      label="Environment"
                      value={
                        <ResourceLink
                          linkage={user.relationships.environment?.data}
                          emptyLabel="Global"
                        />
                      }
                    />
                    <Attribute.Field
                      variant="text"
                      label="Group"
                      value={
                        <ResourceLink
                          linkage={user.relationships.group?.data}
                        />
                      }
                    />
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={user} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard
                    title="Other attributes"
                    contentClass="space-y-2"
                  >
                    {user ? (
                      <CollapsibleMenu title="Properties" className="space-y-2">
                        <Attribute.Field
                          label="Created at"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="date"
                              dateStyle="absolute"
                              value={user.attributes.created}
                            />
                          }
                        />
                        <Attribute.Field
                          label="Updated at"
                          variant="none"
                          value={
                            <Attribute.Value
                              type="date"
                              dateStyle="absolute"
                              value={user.attributes.updated}
                            />
                          }
                        />
                      </CollapsibleMenu>
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
                      filters={{ resource: { type: "user", id } }}
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
            <SidebarHeader className="min-h-[70px] justify-end p-0">
              <TabsSwitch
                options={[
                  { value: "overview", label: "Overview", icon: Menu },
                  { value: "events", label: "Events", icon: GitFork },
                ]}
              />
            </SidebarHeader>
            <SidebarContent>
              <TabsContent value="overview">
                {user ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        type="date"
                        value={user.attributes.created}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        type="date"
                        value={user.attributes.updated}
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

              <TabsContent
                value="events"
                className="flex min-h-0 flex-1 flex-col p-0"
              >
                <EventLogs.Feed
                  compact
                  filters={{ resource: { type: "user", id } }}
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

      <Users.Form.Edit
        id={id}
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${user?.attributes.fullName || user?.attributes.email}`}
        description="Are you sure you want to delete this user? This action cannot be undone. All licenses and machines associated with this user will also be deleted."
        open={open.delete}
        disabled={userLoading}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteUser}
        label="Delete"
        variant="destructive"
        confirmText={user?.attributes.email || "delete user"}
      />

      {user && (
        <Users.AdvancedDialog
          id={user.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}

      <ConfirmationModal
        title="Reset Password"
        description={`Are you sure you want to send password reset instructions to ${user?.attributes.email}?`}
        open={open.resetPassword}
        disabled={userLoading || resetPassword.isPending}
        onClose={() => toggleOpen("resetPassword", false)}
        onConfirm={handleResetPassword}
      />
    </section>
  )
}
