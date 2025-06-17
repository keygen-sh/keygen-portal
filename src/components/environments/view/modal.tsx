import { useState, useEffect, useCallback } from "react"

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

import { useSlide } from "@/hooks/use-slide"

import {
  Environment,
  EnvironmentMode,
  EnvironmentView,
} from "@/types/environments"

import * as keygen from "@/keygen"
import { toast } from "@/lib/toast"
import * as Motion from "@/components/motion"
import EnvironmentsList from "./list"
import EnvironmentDetails from "./details"

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
  const [view, direction, goTo] = useSlide(
    [EnvironmentView.LIST, EnvironmentView.DETAILS],
    EnvironmentView.LIST,
  )

  const [data, setData] = useState<Environment[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const environments = await keygen.environments.list({})
        setData(environments.data ?? [])
      } catch (error) {
        console.error("Error fetching environments:", error)
        toast({
          message: "Failed to fetch environments",
          variant: "error",
        })
      } finally {
        setFetching(false)
      }
    }

    fetchEnvironments()
  }, [])

  const handleViewDetails = useCallback(
    (environment: Environment) => {
      onSelectEnvironment(environment)
      goTo(EnvironmentView.DETAILS)
    },
    [onSelectEnvironment],
  )

  const handleBackToList = useCallback(() => {
    onSelectEnvironment(null)
    goTo(EnvironmentView.LIST)
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
        toast({
          message: "Environment deleted",
          variant: "success",
        })
        onSelectEnvironment(null)
        goTo(EnvironmentView.LIST)
      })
      .catch((error) => {
        console.error("Error deleting environment:", error)
        toast({
          message: "Failed to delete environment",
          variant: "error",
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

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
        <Motion.Slide direction={direction}>
          {view === EnvironmentView.LIST ? (
            <EnvironmentsList
              key="list"
              data={data}
              fetching={fetching}
              onViewDetails={handleViewDetails}
            />
          ) : (
            selectedEnvironment && (
              <EnvironmentDetails
                key="details"
                environment={selectedEnvironment}
                onEditEnvironment={() => handleStartEdit(selectedEnvironment)}
                loading={loading}
                onDeleteEnvironment={() =>
                  handleDeleteEnvironment(selectedEnvironment.id)
                }
              />
            )
          )}
        </Motion.Slide>
      </ScrollArea>

      <DialogFooter className="border-t border-accent p-4">
        {view === EnvironmentView.LIST && (
          <Button onClick={handleStartCreate}>Create Environment</Button>
        )}
        {view === EnvironmentView.DETAILS && selectedEnvironment && (
          <Button variant="outline" onClick={handleBackToList}>
            Back to List
          </Button>
        )}
      </DialogFooter>
    </>
  )
}
