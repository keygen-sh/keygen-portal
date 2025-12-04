import { useCallback } from "react"

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

import * as Motion from "@/components/motion"
import EnvironmentsList from "./list"
import EnvironmentDetails from "./details"
import { toast } from "@/lib/toast"

interface EnvironmentsViewModalProps {
  selectedEnvironment: Environment | null
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: EnvironmentMode, env?: Environment) => void
}

export default function EnvironmentsViewModal({
  selectedEnvironment,
  onSelectEnvironment,
  onChangeMode,
}: EnvironmentsViewModalProps) {
  const deleteEnvironment = useRemoveEnvironment(selectedEnvironment?.id ?? "")

  const [view, direction, goTo] = useSlide(
    [EnvironmentView.List, EnvironmentView.Details],
    EnvironmentView.List,
  )

  const handleViewDetails = useCallback(
    (environment: Environment) => {
      onSelectEnvironment(environment)
      goTo(EnvironmentView.Details)
    },
    [goTo, onSelectEnvironment],
  )

  const handleBackToList = useCallback(() => {
    onSelectEnvironment(null)
    goTo(EnvironmentView.List)
  }, [goTo, onSelectEnvironment])

  const handleDeleteEnvironment = () => {
    deleteEnvironment.mutate(undefined, {
      onSuccess: () => {
        toast({
          message: "Environment deleted",
          variant: "success",
        })
        onSelectEnvironment(null)
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
              {view === EnvironmentView.Details && selectedEnvironment && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {selectedEnvironment.attributes.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </DialogTitle>
      </DialogHeader>

      <ScrollArea className="h-[60vh] md:h-[40vh]">
        <Motion.Slide direction={direction}>
          {view === EnvironmentView.List ? (
            <EnvironmentsList
              key="environment-list"
              onViewDetails={handleViewDetails}
            />
          ) : (
            selectedEnvironment && (
              <EnvironmentDetails
                key="environment-details"
                environment={selectedEnvironment}
                loading={deleteEnvironment.isPending}
                onDeleteEnvironment={handleDeleteEnvironment}
                onEditEnvironment={() =>
                  onChangeMode(EnvironmentMode.Edit, selectedEnvironment)
                }
              />
            )
          )}
        </Motion.Slide>
      </ScrollArea>

      <DialogFooter className="border-t border-accent p-4">
        {view === EnvironmentView.List && (
          <Button onClick={() => onChangeMode(EnvironmentMode.Create)}>
            Create Environment
          </Button>
        )}
        {view === EnvironmentView.Details && selectedEnvironment && (
          <Button variant="outline" onClick={handleBackToList}>
            Back to List
          </Button>
        )}
      </DialogFooter>
    </>
  )
}
