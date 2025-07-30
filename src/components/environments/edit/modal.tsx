import { useState, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { Globe, GlobeLock } from "lucide-react"

import {
  Environment,
  EnvironmentMode,
  IsolationStrategy,
  EnvironmentErrorCode,
} from "@/types/environments"
import type { EditEnvironmentFormValues } from "./edit-form"

import { useUpdateEnvironment } from "@/queries/environments"

import { toast } from "@/lib/toast"
import EditForm from "./edit-form"

interface EnvironmentsEditModalProps {
  selectedEnvironment: Environment
  onChangeMode: (mode: EnvironmentMode, env?: Environment) => void
}

export default function EnvironmentsEditModal({
  selectedEnvironment,
  onChangeMode,
}: EnvironmentsEditModalProps) {
  const updateEnvironment = useUpdateEnvironment(selectedEnvironment.id)
  const [formError, setFormError] = useState<string | null>(null)

  const handleUpdateEnvironment = useCallback(
    (values: EditEnvironmentFormValues) => {
      setFormError(null)

      updateEnvironment.mutate(values, {
        onSuccess(updated) {
          toast({ message: "Environment updated", variant: "success" })
          onChangeMode(EnvironmentMode.VIEW, updated)
        },
        onError: (error) => {
          if (
            typeof error === "object" &&
            error &&
            "code" in error &&
            error.code === EnvironmentErrorCode.CODE_TAKEN
          ) {
            setFormError("Code already exists")
          }
          toast({ message: "Failed to update environment", variant: "error" })
        },
        onSettled() {
          if (!updateEnvironment.isError) {
            onChangeMode(EnvironmentMode.VIEW)
          }
        },
      })
    },
    [updateEnvironment, onChangeMode],
  )

  return (
    <>
      <DialogHeader className="h-fit border-b border-accent p-2">
        <DialogDescription className="flex h-5 items-center space-x-1 text-xs text-content-normal">
          Editing a
          <Badge variant="secondary" className="mx-1">
            {selectedEnvironment.attributes.isolationStrategy ===
            IsolationStrategy.ISOLATED ? (
              <>
                <GlobeLock />
                Isolated
              </>
            ) : (
              <>
                <Globe />
                Shared
              </>
            )}
          </Badge>
          environment
        </DialogDescription>
        <DialogTitle>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Update attributes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DialogTitle>
      </DialogHeader>

      <EditForm
        error={formError}
        environment={selectedEnvironment}
        onSubmit={handleUpdateEnvironment}
        onCancel={() => onChangeMode(EnvironmentMode.VIEW)}
        loading={updateEnvironment.isPending}
      />
    </>
  )
}
