import { useState, useEffect, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
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
} from "@/types/environments"

import * as keygen from "@/keygen"

import EditForm from "./edit-form"

interface EnvironmentsViewModalProps {
  open: boolean
  onClose: () => void
  selectedEnvironment: Environment
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
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    if (selectedEnvironment) {
      setName(selectedEnvironment.attributes.name || null)
      setCode(selectedEnvironment.attributes.code || null)
    }
  }, [selectedEnvironment])

  const handleUpdateEnvironment = useCallback(async () => {
    setLoading(true)

    try {
      const existingAttributes = selectedEnvironment.attributes
      const updates: Partial<{ name: string | null; code: string | null }> = {}

      if (name !== existingAttributes.name) {
        updates.name = name
      }

      if (code !== existingAttributes.code) {
        updates.code = code
      }

      // Bail if no updates
      if (Object.keys(updates).length === 0) {
        setLoading(false)
        onChangeMode(EnvironmentMode.VIEW, selectedEnvironment)
        return
      }

      const updatedEnvironment = (await keygen.environments.update({
        id: selectedEnvironment.id,
        name: updates.name ?? null,
        code: updates.code ?? null,
      })) as Environment

      if (!updatedEnvironment) {
        throw new Error("Failed to update environment.")
      }

      onSelectEnvironment(updatedEnvironment)
      onChangeMode(EnvironmentMode.VIEW, updatedEnvironment)
    } catch (error) {
      console.error("Error updating environment:", error)
    } finally {
      setLoading(false)
    }
  }, [name, code, onSelectEnvironment, onChangeMode])

  const handleCancelUpdate = useCallback(() => {
    onChangeMode(EnvironmentMode.VIEW)
  }, [onChangeMode])

  const handleNameChange = useCallback((newName: string) => {
    setName(newName)
  }, [])

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex min-w-[700px] flex-col justify-between p-0 transition-all duration-300">
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
          name={name}
          code={code}
          onNameChange={handleNameChange}
          onCodeChange={handleCodeChange}
          environment={selectedEnvironment}
          onSubmit={handleUpdateEnvironment}
          onCancel={handleCancelUpdate}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
