import { useState, useEffect } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { formatDate } from "date-fns"

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
  Ban,
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
  MockUsers,
  UserAttributeDescriptions,
  UserStatus,
  UserStatusLabels,
  UserStatusVariants,
  UserStatusDescriptions,
  UserRoleLabels,
} from "@/types/users"

import { useMobile } from "@/hooks/use-mobile"

import { copyToClipboard } from "@/lib/clipboard"

import * as keygen from "@/keygen"
import * as Users from "@/components/users"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import GoToButton from "@/components/go-to-button"
import ConfirmationModal from "@/components/confirmation-modal"
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleMenu from "@/components/collapsible-menu"
import CollapsibleCard from "@/components/collapsible-card"

const UserStatusIcons: Record<UserStatus, React.ReactNode> = {
  [UserStatus.Active]: <CircleCheck className="size-3" />,
  [UserStatus.Inactive]: <CirclePause className="size-3" />,
  [UserStatus.Banned]: <Ban className="size-3" />,
}

export default function UserDetails() {
  const { id } = useParams({ from: "/$accountId/app/users/$id" })

  const user = MockUsers.find((u) => u.id === id)
  const [userLoading, setUserLoading] = useState(true)
  const [userFetching, setUserFetching] = useState(true)
  const userError = false

  const navigate = useNavigate()

  const isMobile = useMobile()
  const [open, setOpen] = useState({
    edit: false,
    delete: false,
    attributes: false,
    resetPassword: false,
    ban: false,
  })

  useEffect(() => {
    ;(async () => {
      if (userError && !userFetching) {
        await navigate({ to: ".." })
      }
    })()
  }, [userError, userFetching, navigate])

  useEffect(() => {
    setTimeout(() => {
      setUserLoading(false)
      setUserFetching(false)
    }, 300)
  }, [])

  const toggleOpen = (key: keyof typeof open, value: boolean) => {
    setOpen((prev) => ({ ...prev, [key]: value }))
  }

  const handleDeleteUser = () => {
    console.log("User deleted.")
    // TODO(cazden) Implement API call
  }

  const handleBanUser = () => {
    console.log("User banned.")
    toggleOpen("ban", false)
    // TODO(cazden) Implement API call
  }

  const handleUnbanUser = () => {
    console.log("User unbanned.")
    // TODO(cazden) Implement API call
  }

  const handleResetPassword = () => {
    console.log(`Password reset instructions sent to ${user?.attributes.email}`)
    toggleOpen("resetPassword", false)
    // TODO(cazden) Implement API call
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
                  Users
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
                    toggleOpen("resetPassword", true)
                    e.currentTarget.blur()
                  }}
                  className="pb-2 text-base"
                >
                  Reset Password
                </DropdownMenuItem>
                <Separator />
                {user?.attributes.status === UserStatus.Banned ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      handleUnbanUser()
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Unban
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={(e) => {
                      toggleOpen("ban", true)
                      e.currentTarget.blur()
                    }}
                    className="pb-2 text-base"
                  >
                    Ban
                  </DropdownMenuItem>
                )}
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
            <div className="flex items-center gap-2">
              {user?.attributes.status === UserStatus.Banned ? (
                <Button
                  variant="outline"
                  disabled={userLoading}
                  onClick={handleUnbanUser}
                >
                  Unban
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={userLoading}
                  onClick={() => toggleOpen("ban", true)}
                >
                  Ban
                </Button>
              )}
              <Button
                variant="outline"
                disabled={userLoading}
                onClick={() => toggleOpen("resetPassword", true)}
              >
                Reset Password
              </Button>

              <Separator orientation="vertical" className="mx-2 h-6!" />

              <Button
                variant="outline"
                disabled={userLoading}
                onClick={() => toggleOpen("edit", true)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                disabled={userLoading}
                onClick={() => toggleOpen("delete", true)}
              >
                Delete
              </Button>
            </div>
          )}
        </PageHeader>

        {user ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton path=".." className="mb-8" />

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
                </CollapsibleCard>

                <CollapsibleCard title="Relationships">
                  <Attribute.Field
                    variant="text"
                    label="Group"
                    value={
                      user.relationships.group?.data ? (
                        <GoToButton
                          path="/$accountId/app/groups/$id"
                          params={{
                            accountId: keygen.config.id,
                            id: user.relationships.group.data.id,
                          }}
                          label="View"
                        />
                      ) : (
                        <span className="text-content-muted">--</span>
                      )
                    }
                  />
                  <Attribute.Field
                    variant="text"
                    label="Licenses"
                    value={
                      <GoToButton
                        path="/$accountId/app/licenses"
                        params={{ accountId: keygen.config.id }}
                        label="View all"
                      />
                    }
                  />
                  <Attribute.Field
                    variant="text"
                    label="Machines"
                    value={
                      <GoToButton
                        path="/$accountId/app/machines"
                        params={{ accountId: keygen.config.id }}
                        label="View all"
                      />
                    }
                  />
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
                          value={formatDate(
                            new Date(String(user.attributes.created)),
                            "PP",
                          )}
                        />
                        <Attribute.Field
                          label="Updated at"
                          value={formatDate(
                            new Date(String(user.attributes.updated)),
                            "PP",
                          )}
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
                {user ? (
                  <>
                    <Property.Section title="Properties" className="p-4">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={formatDate(
                          new Date(String(user.attributes.created)),
                          "PP",
                        )}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={formatDate(
                          new Date(String(user.attributes.updated)),
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

      <Users.Edit.Modal
        open={open.edit}
        onClose={() => toggleOpen("edit", false)}
        user={user!}
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
        disabled={userLoading}
        onClose={() => toggleOpen("resetPassword", false)}
        onConfirm={handleResetPassword}
      />

      <ConfirmationModal
        title={`Ban ${user?.attributes.fullName || user?.attributes.email}?`}
        description="Are you sure you want to ban this user? They will no longer be able to authenticate with the API."
        open={open.ban}
        disabled={userLoading}
        onClose={() => toggleOpen("ban", false)}
        onConfirm={handleBanUser}
        confirmVariant="destructive"
      />
    </section>
  )
}
