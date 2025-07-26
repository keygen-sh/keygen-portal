import { copyToClipboard } from "@/lib/clipboard"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { Copy, Globe, GlobeLock } from "lucide-react"

import { Environment } from "@/types/environments"

import CollapsibleCard from "@/components/collapsible-card"
import CollapsibleMenu from "@/components/collapsible-menu"
import * as Attribute from "@/components/attribute"
import * as Loading from "@/components/loading"

interface EnvironmentDetailsProps {
  environment: Environment
  loading: boolean
  onEditEnvironment: () => void
  onDeleteEnvironment: () => void
}

export default function EnvironmentDetails({
  environment,
  loading,
  onEditEnvironment,
  onDeleteEnvironment,
}: EnvironmentDetailsProps) {
  return (
    <>
      <div className="flex flex-col justify-between p-4 md:flex-row">
        <div className="flex flex-col space-y-2">
          <h2 className="text-sm">
            {environment.attributes.isolationStrategy === "ISOLATED" ? (
              <Badge variant="secondary">
                <GlobeLock className="inline size-4" />
                Isolated
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Globe className="inline size-4" />
                Shared
              </Badge>
            )}
          </h2>
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
          <Button variant="outline" onClick={onEditEnvironment}>
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete environment {environment.attributes.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the environment and queue all resources for
                  removal.
                  <br />
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={loading}
                  onClick={onDeleteEnvironment}
                >
                  {loading ? (
                    <Loading.Dots className="bg-background" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="m-4 mt-0">
        <CollapsibleCard title="Environment attributes">
          <CollapsibleMenu
            title="Environment details"
            className="flex flex-col space-y-4 md:flex-row md:space-y-0"
          >
            <div className="flex-1 space-y-4">
              <Attribute.Field
                label="Code"
                value={environment.attributes.code}
              />
              <Attribute.Field
                label="Isolation Strategy"
                value={environment.attributes.isolationStrategy}
              />
            </div>
            <div className="mx-4 hidden md:block">
              <Separator orientation="vertical" dashed={true} />
            </div>
            <div className="flex-1 space-y-4">
              <Attribute.Field
                label="Created"
                value={environment.attributes.created}
              />
            </div>
          </CollapsibleMenu>
        </CollapsibleCard>
      </div>
    </>
  )
}
