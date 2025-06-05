import { useState, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
  EnvironmentModes,
  EnvironmentViews,
} from "@/types/environments"

import * as keygen from "@/keygen"

import EnvironmentsList from "./list"
import EnvironmentDetails from "./details"

interface EnvironmentsViewModalProps {
  open: boolean
  onClose: () => void
  selectedEnvironment: Environment | null
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: EnvironmentModes, env?: Environment) => void
}

export default function EnvironmentsViewModal({
  open,
  onClose,
  selectedEnvironment,
  onSelectEnvironment,
  onChangeMode,
}: EnvironmentsViewModalProps) {
  const [data, setData] = useState<Environment[]>([])
  const [fetching, setFetching] = useState(true)
  const [view, setView] = useState<EnvironmentViews>(EnvironmentViews.LIST)

  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const environments = await keygen.environments.list({})
        setData(environments.data ?? [])
      } catch (error) {
        console.error("Error fetching environments:", error)
      } finally {
        setFetching(false)
      }
    }

    fetchEnvironments()
  }, [])

  const handleViewDetails = useCallback(
    (environment: Environment) => {
      onSelectEnvironment(environment)
      setView(EnvironmentViews.DETAILS)
    },
    [onSelectEnvironment],
  )

  const handleBackToList = useCallback(() => {
    onSelectEnvironment(null)
    setView(EnvironmentViews.LIST)
  }, [onSelectEnvironment])

  const handleStartCreate = useCallback(() => {
    onChangeMode(EnvironmentModes.CREATE)
  }, [onChangeMode])

  const handleStartEdit = useCallback(
    (environment: Environment) => {
      onSelectEnvironment(environment)
      onChangeMode(EnvironmentModes.EDIT)
    },
    [onSelectEnvironment, onChangeMode],
  )

  const handleDeleteEnvironment = useCallback(async (id: string) => {
    await keygen.environments
      .remove({ id })
      .then(() => {
        setData((prev) => prev.filter((env) => env.id !== id))
        onSelectEnvironment(null)
        setView(EnvironmentViews.LIST)
      })
      .catch((error) => {
        console.error("Error deleting environment:", error)
      })
  }, [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex min-w-[700px] flex-col justify-between p-0 transition-all duration-300">
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
            Viewing environments
          </DialogDescription>
          <DialogTitle>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {view === EnvironmentViews.LIST ? (
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
                {view === EnvironmentViews.DETAILS && selectedEnvironment && (
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

        {view === EnvironmentViews.LIST && (
          <EnvironmentsList
            data={data}
            fetching={fetching}
            onViewDetails={handleViewDetails}
          />
        )}

        {view === EnvironmentViews.DETAILS && selectedEnvironment && (
          <EnvironmentDetails
            environment={selectedEnvironment}
            onEditEnvironment={() => handleStartEdit(selectedEnvironment)}
            onDeleteEnvironment={() =>
              handleDeleteEnvironment(selectedEnvironment.id)
            }
          />
        )}
        <DialogFooter className="border-t border-accent p-4">
          {view === EnvironmentViews.DETAILS && selectedEnvironment && (
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          )}
          {view === EnvironmentViews.LIST && (
            <Button onClick={handleStartCreate}>Create Environment</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
