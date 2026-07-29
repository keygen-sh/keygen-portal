import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

import { Copy, Globe, GlobeLock, Check } from "lucide-react"

import {
  Environment,
  IsolationStrategy,
  IsolationStrategyLabels,
  IsolationStrategyDescriptions,
  EnvironmentAttributeDescriptions,
} from "@/types/environments"

import { copyToClipboard } from "@/lib/clipboard"

import * as Loading from "@/components/loading"
import * as Attribute from "@/components/attribute"
import TooltipBadge from "@/components/tooltip-badge"
import CollapsibleCard from "@/components/collapsible-card"
import ConfirmationModal from "@/components/confirmation-modal"

const IsolationStrategyIcons: Record<IsolationStrategy, ReactNode> = {
  [IsolationStrategy.Isolated]: <GlobeLock className="size-3" />,
  [IsolationStrategy.Shared]: <Globe className="size-3" />,
}

interface EnvironmentDetailsProps {
  environment: Environment
  loading: boolean
  active: boolean
  switching: boolean
  onSwitchEnvironment: () => void
  onEditEnvironment: () => void
  onDeleteEnvironment: () => void
}

export default function EnvironmentDetails({
  environment,
  loading,
  active,
  switching,
  onSwitchEnvironment,
  onEditEnvironment,
  onDeleteEnvironment,
}: EnvironmentDetailsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isCurrent = active && !switching

  return (
    <>
      <div className="flex flex-col justify-between p-4 md:flex-row">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <TooltipBadge
              variant="secondary"
              icon={
                IsolationStrategyIcons[environment.attributes.isolationStrategy]
              }
              value={
                IsolationStrategyLabels[
                  environment.attributes.isolationStrategy
                ]
              }
              tooltip={
                IsolationStrategyDescriptions[
                  environment.attributes.isolationStrategy
                ]
              }
              className="px-1 text-xs"
            />
            {isCurrent && (
              <TooltipBadge
                variant="success"
                icon={<Check className="size-3" />}
                value="Current"
                tooltip="This is the environment you're currently in and where new resources will be created."
                className="px-1 text-xs"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-owners-wide text-2xl font-medium">
              {environment.attributes.name}
            </h1>
            <Button
              variant="clipboard"
              size="clipboard"
              onClick={() => copyToClipboard(environment.attributes.code)}
              className="pb-0.5"
            >
              {environment.attributes.code}
              <Copy className="size-3 pt-0.5" />
            </Button>
          </div>
        </div>
        <div className="my-2 block md:hidden">
          <Separator />
        </div>
        <div className="mt-2 flex space-x-2 md:mt-0">
          <Button
            variant="outline"
            onClick={onEditEnvironment}
            disabled={switching}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            disabled={switching}
          >
            Delete
          </Button>
          {!isCurrent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onSwitchEnvironment} disabled={switching}>
                  {switching ? (
                    <Loading.Dots className="bg-background" />
                  ) : (
                    "Switch"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="end"
                sideOffset={4}
                className="max-w-56 bg-background-4 text-wrap text-content-muted"
              >
                Switch into this environment.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="m-4 mt-0">
        <CollapsibleCard title="Attributes">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0">
            <div className="flex-1 space-y-4">
              <Attribute.Field
                variant="none"
                label="Code"
                value={
                  <Attribute.Value
                    type="raw"
                    value={environment.attributes.code}
                    tooltip={EnvironmentAttributeDescriptions.code}
                  />
                }
              />
              <Attribute.Field
                variant="none"
                label="Isolation Strategy"
                value={
                  <Attribute.Value
                    type="enum"
                    value={environment.attributes.isolationStrategy}
                    tooltip={EnvironmentAttributeDescriptions.isolationStrategy}
                  />
                }
              />
            </div>
            <div className="mx-4 hidden md:block">
              <Separator orientation="vertical" dashed={true} />
            </div>
            <div className="flex-1 space-y-4">
              <Attribute.Field
                variant="none"
                label="Created"
                value={
                  <Attribute.Value
                    type="date"
                    dateStyle="absolute"
                    value={environment.attributes.created}
                  />
                }
              />
              <Attribute.Field
                variant="none"
                label="Updated"
                value={
                  <Attribute.Value
                    type="date"
                    dateStyle="absolute"
                    value={environment.attributes.updated}
                  />
                }
              />
            </div>
          </div>
        </CollapsibleCard>
      </div>

      <ConfirmationModal
        title={`Delete ${environment.attributes.name}`}
        description="This will remove the environment and queue all resources for removal. This action cannot be undone."
        open={deleteOpen}
        disabled={loading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDeleteEnvironment}
        label="Delete"
        variant="destructive"
        confirmText={environment.attributes.name || "delete environment"}
      />
    </>
  )
}
