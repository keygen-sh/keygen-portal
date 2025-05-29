import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

import { Environment } from "@/types/environments"
import { MODES, VIEWS } from "@/constants/environments"

import EnvironmentsList from "./list"
import EnvironmentDetails from "./details"

interface EnvironmentsViewModalProps {
  open: boolean
  onClose: () => void
  selectedEnvironment: Environment | null
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: MODES, env?: Environment) => void
}

export default function EnvironmentsViewModal({
  open,
  onClose,
  selectedEnvironment,
  onSelectEnvironment,
  onChangeMode,
}: EnvironmentsViewModalProps) {
  const [view, setView] = useState<VIEWS>(VIEWS.LIST)

  const handleViewDetails = useCallback(
    (environment: Environment) => {
      onSelectEnvironment(environment)
      setView(VIEWS.DETAILS)
    },
    [onSelectEnvironment],
  )

  const handleBackToList = useCallback(() => {
    onSelectEnvironment(null)
    setView(VIEWS.LIST)
  }, [onSelectEnvironment])

  const handleStartCreate = useCallback(() => {
    onChangeMode(MODES.CREATE)
  }, [onChangeMode])

  const handleStartEdit = useCallback(
    (environment: Environment) => {
      onSelectEnvironment(environment)
      onChangeMode(MODES.EDIT)
    },
    [onSelectEnvironment, onChangeMode],
  )

  const handleDeleteEnvironment = useCallback((id: string) => {
    console.log("Deleting environment:", id)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex min-w-[700px] flex-col justify-between p-0 transition-all duration-300">
        <DialogHeader className="h-fit border-b border-accent p-4">
          <DialogTitle>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {view === VIEWS.LIST ? (
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
                {view === VIEWS.DETAILS && selectedEnvironment && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {selectedEnvironment.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </DialogTitle>
        </DialogHeader>

        {view === VIEWS.LIST && (
          <EnvironmentsList onViewDetails={handleViewDetails} />
        )}

        {view === VIEWS.DETAILS && selectedEnvironment && (
          <EnvironmentDetails
            environment={selectedEnvironment}
            onEditEnvironment={() => handleStartEdit(selectedEnvironment)}
            onDeleteEnvironment={() =>
              handleDeleteEnvironment(selectedEnvironment.id)
            }
          />
        )}
        <DialogFooter className="border-t border-accent p-4">
          {view === VIEWS.DETAILS && selectedEnvironment && (
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          )}
          {view === VIEWS.LIST && (
            <Button onClick={handleStartCreate}>Create Environment</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
