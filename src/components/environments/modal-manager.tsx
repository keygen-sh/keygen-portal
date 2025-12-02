import { useState, useCallback } from "react"
import { AnimatePresence } from "motion/react"

import { Dialog, DialogContent } from "@/components/ui/dialog"

import { Environment, EnvironmentMode } from "@/types/environments"

import * as Motion from "@/components/motion"
import * as View from "@/components/environments/view"
import * as Edit from "@/components/environments/edit"
import * as Create from "@/components/environments/create"

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

  // TODO(cazden) Standardize Motion.Scale usage across modals or remove this case
  return (
    <AnimatePresence mode="wait">
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex flex-col justify-between p-0 transition-all duration-300 md:min-w-[700px]">
          {mode === EnvironmentMode.View && (
            <Motion.Scale key="view">
              <View.Modal
                selectedEnvironment={selectedEnvironment}
                onSelectEnvironment={handleSelectEnvironment}
                onChangeMode={handleChangeMode}
              />
            </Motion.Scale>
          )}
          {mode === EnvironmentMode.Edit && selectedEnvironment && (
            <Motion.Scale key="edit">
              <Edit.Modal
                selectedEnvironment={selectedEnvironment}
                onChangeMode={handleChangeMode}
              />
            </Motion.Scale>
          )}
          {mode === EnvironmentMode.Create && (
            <Motion.Scale key="create">
              <Create.Modal
                onSelectEnvironment={handleSelectEnvironment}
                onChangeMode={handleChangeMode}
              />
            </Motion.Scale>
          )}
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
