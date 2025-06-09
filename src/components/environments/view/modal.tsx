import { useState, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  EnvironmentMode,
  EnvironmentView,
} from "@/types/environments"

import * as keygen from "@/keygen"

import EnvironmentsList from "./list"
import EnvironmentDetails from "./details"

interface EnvironmentsViewModalProps {
  open: boolean
  onClose: () => void
  selectedEnvironment: Environment | null
  onSelectEnvironment: (env: Environment | null) => void
  onChangeMode: (mode: EnvironmentMode, env?: Environment) => void
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
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<EnvironmentView>(EnvironmentView.LIST)

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
      setView(EnvironmentView.DETAILS)
    },
    [onSelectEnvironment],
  )

  const handleBackToList = useCallback(() => {
    onSelectEnvironment(null)
    setView(EnvironmentView.LIST)
  }, [onSelectEnvironment])

  const handleStartCreate = useCallback(() => {
    onChangeMode(EnvironmentMode.CREATE)
  }, [onChangeMode])

  const handleStartEdit = useCallback(
    (environment: Environment) => {
      onSelectEnvironment(environment)
      onChangeMode(EnvironmentMode.EDIT)
    },
    [onSelectEnvironment, onChangeMode],
  )

  const handleDeleteEnvironment = useCallback(async (id: string) => {
    setLoading(true)
    await keygen.environments
      .remove({ id })
      .then(() => {
        setData((prev) => prev.filter((env) => env.id !== id))
        onSelectEnvironment(null)
        setView(EnvironmentView.LIST)
      })
      .catch((error) => {
        console.error("Error deleting environment:", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col justify-between p-0 transition-all duration-300 md:min-w-[700px]">
        <DialogHeader className="h-fit border-b border-accent p-2">
          <DialogDescription className="flex h-5 items-center space-x-1 text-xs">
            Viewing environments
          </DialogDescription>
          <DialogTitle>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {view === EnvironmentView.LIST ? (
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
                {view === EnvironmentView.DETAILS && selectedEnvironment && (
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
          {view === EnvironmentView.LIST && (
            <EnvironmentsList
              data={data}
              fetching={fetching}
              onViewDetails={handleViewDetails}
            />
          )}

          {view === EnvironmentView.DETAILS && selectedEnvironment && (
            <EnvironmentDetails
              environment={selectedEnvironment}
              onEditEnvironment={() => handleStartEdit(selectedEnvironment)}
              loading={loading}
              onDeleteEnvironment={() =>
                handleDeleteEnvironment(selectedEnvironment.id)
              }
            />
          )}
        </ScrollArea>
        <DialogFooter className="border-t border-accent p-4">
          {view === EnvironmentView.DETAILS && selectedEnvironment && (
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
          )}
          {view === EnvironmentView.LIST && (
            <Button onClick={handleStartCreate}>Create Environment</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
