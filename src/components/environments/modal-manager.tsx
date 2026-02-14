import { useState, useCallback } from "react"
import { AnimatePresence } from "motion/react"

import { Dialog, DialogContent } from "@/components/ui/dialog"

import { Environment, EnvironmentMode } from "@/types/environments"

import * as View from "@/components/environments/view"

import EditEnvironmentForm from "./form/edit"
import CreateEnvironmentForm from "./form/create"

interface EnvironmentsModalManagerProps {
  open: boolean
  onClose: () => void
}

export default function EnvironmentsModalManager({
  open,
  onClose,
}: EnvironmentsModalManagerProps): React.ReactElement {
  const [mode, setMode] = useState<EnvironmentMode>(EnvironmentMode.View)
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<Environment | null>(null)

  const handleSelectEnvironment = useCallback(
    (environment: Environment | null) => {
      setSelectedEnvironment(environment)
    },
    [],
  )

  const handleChangeMode = useCallback((newMode: EnvironmentMode) => {
    setMode(newMode)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col justify-between p-0 transition-all duration-300 md:min-w-[700px]">
          {mode === EnvironmentMode.View && (
            <View.Modal
              selectedEnvironment={selectedEnvironment}
              onSelectEnvironment={handleSelectEnvironment}
              onChangeMode={handleChangeMode}
            />
          )}
          {mode === EnvironmentMode.Edit && selectedEnvironment && (
            <EditEnvironmentForm
              environment={selectedEnvironment}
              open={mode === EnvironmentMode.Edit}
              onOpenChange={(newOpen) => {
                if (!newOpen) {
                  handleSelectEnvironment(null)
                  handleChangeMode(EnvironmentMode.View)
                }
              }}
            />
          )}
          {mode === EnvironmentMode.Create && (
            <CreateEnvironmentForm
              open={mode === EnvironmentMode.Create}
              onOpenChange={(newOpen) => {
                if (!newOpen) {
                  handleChangeMode(EnvironmentMode.View)
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
