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
  Logs,
  Menu,
  Copy,
  GitFork,
  SquarePen,
  SquarePlus,
  EllipsisVertical,
  Tag,
  CircleDashed,
  CircleCheck,
  CircleX,
} from "lucide-react"

import {
  ArtifactStatus,
  ArtifactAttributeDescriptions,
  ArtifactStatusLabels,
  ArtifactStatusVariants,
  ArtifactStatusDescriptions,
} from "@/types/artifacts"

import * as keygen from "@/keygen"

import { useGetRelease } from "@/queries/releases"
import { useGetArtifact, useRemoveArtifact } from "@/queries/artifacts"

import { useMobile } from "@/hooks/use-mobile"
import { useBackNavigate } from "@/hooks/use-back-navigate"

import { toast } from "@/lib/toast"
import { copyToClipboard } from "@/lib/clipboard"

import * as Artifacts from "@/components/artifacts"
import * as Property from "@/components/property"
import * as Attribute from "@/components/attribute"
import Can from "@/components/can"
import Metadata from "@/components/metadata"
import PageHeader from "@/components/page-header"
import TabsSwitch from "@/components/tabs-switch"
import BackButton from "@/components/back-button"
import GoToButton from "@/components/go-to-button"
import ConfirmationModal from "@/components/confirmation-modal"
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleCard from "@/components/collapsible-card"

const ArtifactStatusIcons: Record<ArtifactStatus, React.ReactNode> = {
  [ArtifactStatus.Waiting]: <CircleDashed className="size-3" />,
  [ArtifactStatus.Uploaded]: <CircleCheck className="size-3" />,
  [ArtifactStatus.Failed]: <CircleX className="size-3" />,
}

export default function ArtifactDetails() {
  const { id } = useParams({ from: "/$accountId/app/artifacts/$id" })
  const { data: artifact, isLoading, isFetching, isError } = useGetArtifact(id)
  const deleteArtifact = useRemoveArtifact(id)

  const releaseId = artifact?.relationships.release?.data?.id || ""
  const { data: release } = useGetRelease(releaseId)

  const back = useBackNavigate()

  const isMobile = useMobile()
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

  const handleDeleteArtifact = () => {
    deleteArtifact.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Artifact deleted",
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
                  Artifacts
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {artifact ? (
                  <BreadcrumbPage>
                    {artifact.attributes.filename}
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
                {artifact?.attributes.status === ArtifactStatus.Uploaded &&
                  artifact.links.redirect && (
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(artifact.links.redirect, "_blank")
                        }
                        className="pb-2 text-base"
                      >
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                <Can permission="artifact.update">
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
                <Can permission="artifact.delete">
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
              {artifact?.attributes.status === ArtifactStatus.Uploaded &&
                artifact.links.redirect && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(artifact.links.redirect, "_blank")
                    }
                  >
                    Download
                  </Button>
                )}
              <Can permission="artifact.update">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => toggleOpen("edit", true)}
                >
                  Edit
                </Button>
              </Can>
              <Can permission="artifact.delete">
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

        {artifact ? (
          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 py-6 md:px-10 md:py-8">
              <BackButton className="mb-8" />

              <div className="mb-2 flex flex-wrap gap-2">
                <TooltipBadge
                  icon={ArtifactStatusIcons[artifact.attributes.status]}
                  value={ArtifactStatusLabels[artifact.attributes.status]}
                  variant={ArtifactStatusVariants[artifact.attributes.status]}
                  tooltip={
                    ArtifactStatusDescriptions[artifact.attributes.status]
                  }
                  className="px-1 text-xs"
                />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <h1 className="font-owners-wide text-2xl font-medium">
                  {artifact.attributes.filename}
                </h1>
                <Button
                  variant="clipboard"
                  size="clipboard"
                  onClick={() => copyToClipboard(artifact.id)}
                  className="w-fit pb-0.5"
                >
                  {artifact.id}
                  <Copy className="size-4 pt-0.5 md:size-3" />
                </Button>
              </div>
              <div className="mt-2 flex h-4 items-center text-sm text-content-subdued">
                <Tag className="mr-2 size-4 pt-0.5" />
                <span>Release:</span>
                {release ? (
                  <GoToButton
                    path="/$accountId/app/releases/$id"
                    params={{
                      accountId: keygen.config.id,
                      id: release.id,
                    }}
                    label={
                      release.attributes.name ?? release.attributes.version
                    }
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
                        label="Filetype"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={artifact.attributes.filetype}
                            tooltip={ArtifactAttributeDescriptions.filetype}
                            emptyLabel="Not set"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Platform"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={artifact.attributes.platform}
                            tooltip={ArtifactAttributeDescriptions.platform}
                            emptyLabel="Not set"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Signature"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={artifact.attributes.signature}
                            tooltip={ArtifactAttributeDescriptions.signature}
                            emptyLabel="Not set"
                          />
                        }
                      />
                    </div>
                    <div className="mt-4 space-y-4 md:mt-0 md:pl-3">
                      <Attribute.Field
                        label="Filesize"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="number"
                            value={artifact.attributes.filesize}
                            tooltip={ArtifactAttributeDescriptions.filesize}
                          />
                        }
                      />
                      <Attribute.Field
                        label="Architecture"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={artifact.attributes.arch}
                            tooltip={ArtifactAttributeDescriptions.arch}
                            emptyLabel="Not set"
                          />
                        }
                      />
                      <Attribute.Field
                        label="Checksum"
                        variant="none"
                        value={
                          <Attribute.Value
                            type="string"
                            value={artifact.attributes.checksum}
                            tooltip={ArtifactAttributeDescriptions.checksum}
                            emptyLabel="Not set"
                          />
                        }
                      />
                    </div>
                  </div>
                </CollapsibleCard>

                <CollapsibleCard title="Metadata" contentClass="p-0">
                  <Metadata resource={artifact} />
                </CollapsibleCard>

                {isMobile && (
                  <CollapsibleCard title="Properties" contentClass="space-y-2">
                    {artifact ? (
                      <>
                        <Property.Field
                          icon={SquarePlus}
                          label="Created at"
                          value={new Date(
                            artifact.attributes.created,
                          ).toLocaleDateString()}
                        />
                        <Property.Field
                          icon={SquarePen}
                          label="Updated at"
                          value={new Date(
                            artifact.attributes.updated,
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
                {artifact ? (
                  <>
                    <Property.Section title="Properties">
                      <Property.Field
                        icon={SquarePlus}
                        label="Created at"
                        value={new Date(
                          artifact.attributes.created,
                        ).toLocaleDateString()}
                      />
                      <Property.Field
                        icon={SquarePen}
                        label="Updated at"
                        value={new Date(
                          artifact.attributes.updated,
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

      <Artifacts.Form.Edit
        open={open.edit}
        onOpenChange={(value) => toggleOpen("edit", value)}
      />

      <ConfirmationModal
        title={`Delete ${artifact?.attributes.filename}`}
        description="Are you sure you want to delete this artifact? This action is irreversible."
        open={open.delete}
        disabled={deleteArtifact.isPending}
        onClose={() => toggleOpen("delete", false)}
        onConfirm={handleDeleteArtifact}
        label="Delete"
        variant="destructive"
        confirmText="delete artifact"
      />

      {artifact && (
        <Artifacts.Dialog.Advanced
          id={artifact.id}
          open={open.attributes}
          onOpenChange={() => toggleOpen("attributes", false)}
        />
      )}
    </section>
  )
}
