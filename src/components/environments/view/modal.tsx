import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  Environment,
  EnvironmentMode,
  EnvironmentView,
} from "@/types/environments"

import { useRemoveEnvironment } from "@/queries/environments"
import { useSlide } from "@/hooks/use-slide"
import { useEnvironment } from "@/hooks/use-environment"

import * as Motion from "@/components/motion"
import * as Loading from "@/components/loading"
import EnvironmentsList from "./list"
import EnvironmentDetails from "./details"
import { toast } from "@/lib/toast"

interface EnvironmentsViewModalProps {
  viewEnvironment: Environment | null
  onViewEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: EnvironmentMode, env?: Environment) => void
  onClose: () => void
}

export default function EnvironmentsViewModal({
  viewEnvironment,
  onViewEnvironment,
  onChangeMode,
  onClose,
}: EnvironmentsViewModalProps) {
  const deleteEnvironment = useRemoveEnvironment(viewEnvironment?.id ?? "")
  const { id: activeEnvironmentId, select } = useEnvironment()

  const [switching, setSwitching] = useState(false)

  const [view, direction, goTo] = useSlide(
    [EnvironmentView.List, EnvironmentView.Details],
    EnvironmentView.List,
  )

  const handleViewDetails = useCallback(
    (environment: Environment) => {
      onViewEnvironment(environment)
      goTo(EnvironmentView.Details)
    },
    [goTo, onViewEnvironment],
  )

  const handleBackToList = useCallback(() => {
    onViewEnvironment(null)
    goTo(EnvironmentView.List)
  }, [goTo, onViewEnvironment])

  const switchTo = async (environment: Environment | null) => {
    setSwitching(true)

    try {
      await select(
        environment?.id ?? null,
        environment?.attributes.code ?? null,
      )
    } catch (error) {
      console.error(error)
      return
    } finally {
      setSwitching(false)
    }

    toast({
      message: `Switched to ${environment?.attributes.name ?? "Global"}`,
      variant: "success",
    })

    onClose()
  }

  const handleSwitchEnvironment = async () => {
    if (!viewEnvironment || viewEnvironment.id === activeEnvironmentId) {
      return
    }

    await switchTo(viewEnvironment)
  }

  const handleSwitchToGlobal = async () => {
    if (activeEnvironmentId == null) {
      return
    }

    await switchTo(null)
  }

  const handleDeleteEnvironment = () => {
    const deleted = viewEnvironment

    deleteEnvironment.mutate(undefined, {
      onSuccess: async () => {
        toast({
          message: "Environment deleted",
          variant: "success",
        })

        // switch to global if active environment was deleted
        if (deleted?.id === activeEnvironmentId) {
          await select(null, null)
        }

        onViewEnvironment(null)
        goTo(EnvironmentView.List)
      },
    })
  }

  return (
    <>
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
          Viewing environments
        </DialogDescription>
        <DialogTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {view === EnvironmentView.List ? (
                  <BreadcrumbPage>Manage Environments</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer"
                    onClick={handleBackToList}
                  >
                    Manage Environments
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {view === EnvironmentView.Details && viewEnvironment && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {viewEnvironment.attributes.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </DialogTitle>
      </DialogHeader>

      <ScrollArea className="h-[calc(100vh-8rem)] md:h-[40vh]">
        <Motion.Slide direction={direction}>
          {view === EnvironmentView.List ? (
            <EnvironmentsList
              key="environment-list"
              onViewDetails={handleViewDetails}
            />
          ) : (
            viewEnvironment && (
              <EnvironmentDetails
                key="environment-details"
                environment={viewEnvironment}
                loading={deleteEnvironment.isPending}
                active={viewEnvironment.id === activeEnvironmentId}
                switching={switching}
                onSwitchEnvironment={handleSwitchEnvironment}
                onDeleteEnvironment={handleDeleteEnvironment}
                onEditEnvironment={() =>
                  onChangeMode(EnvironmentMode.Edit, viewEnvironment)
                }
              />
            )
          )}
        </Motion.Slide>
      </ScrollArea>

      <DialogFooter className="border-t border-accent p-4">
        {view === EnvironmentView.List && (
          <div className="flex items-center gap-2">
            {activeEnvironmentId != null && (
              <Button
                onClick={handleSwitchToGlobal}
                disabled={switching}
                className="min-w-36"
              >
                {switching ? <Loading.Dots /> : "Switch to Global"}
              </Button>
            )}
            <Button
              onClick={() => onChangeMode(EnvironmentMode.Create)}
              disabled={switching}
            >
              New Environment
            </Button>
          </div>
        )}
        {view === EnvironmentView.Details && viewEnvironment && (
          <Button
            variant="outline"
            onClick={handleBackToList}
            disabled={switching}
          >
            Back to List
          </Button>
        )}
      </DialogFooter>
    </>
  )
}
