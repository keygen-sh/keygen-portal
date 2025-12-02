import { useState, useCallback } from "react"

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

import * as Forms from "@/forms"
import {
  Environment,
  EnvironmentMode,
  IsolationStrategy,
  EnvironmentErrorCode,
} from "@/types/environments"

import { useUpdateEnvironment } from "@/queries/environments"

import { toast } from "@/lib/toast"
import EditForm from "./edit-form"

import { BadgeGroup, BadgeGroupItem } from "@/components/badge-group"

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
    (values: Forms.Environments.UpdatePayload) => {
      setFormError(null)

      updateEnvironment.mutate(values, {
        onSuccess(updated) {
          toast({ message: "Environment updated", variant: "success" })
          onChangeMode(EnvironmentMode.View, updated)
        },
        onError: (error) => {
          if (
            typeof error === "object" &&
            error &&
            "code" in error &&
            error.code === EnvironmentErrorCode.CodeTaken
          ) {
            setFormError("Code already exists")
          }
          toast({ message: "Failed to update environment", variant: "error" })
        },
        onSettled() {
          if (!updateEnvironment.isError) {
            onChangeMode(EnvironmentMode.View)
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
          <BadgeGroup prefix="Updating an existing" suffix="environment">
            <BadgeGroupItem>
              {selectedEnvironment.attributes.isolationStrategy ===
              IsolationStrategy.Isolated ? (
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
            </BadgeGroupItem>
          </BadgeGroup>
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
        onCancel={() => onChangeMode(EnvironmentMode.View)}
        loading={updateEnvironment.isPending}
      />
    </>
  )
}
