import { useState, useCallback } from "react"

import { Environment, EnvironmentModes } from "@/types/environments"

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
  const [mode, setMode] = useState<EnvironmentModes>(EnvironmentModes.VIEW)
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<Environment | null>(null)

  const handleSelectEnvironment = useCallback(
    (environment: Environment | null) => {
      setSelectedEnvironment(environment)
    },
    [],
  )

  const handleChangeMode = useCallback((newMode: EnvironmentModes) => {
    setMode(newMode)
  }, [])

  return (
    <>
      {mode === EnvironmentModes.VIEW && (
        <View.Modal
          open={open}
          onClose={onClose}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={handleSelectEnvironment}
          onChangeMode={handleChangeMode}
        />
      )}
      {mode === EnvironmentModes.EDIT && selectedEnvironment && (
        <Edit.Modal
          open={open}
          onClose={onClose}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={handleSelectEnvironment}
          onChangeMode={handleChangeMode}
        />
      )}
      {mode === EnvironmentModes.CREATE && (
        <Create.Modal
          open={open}
          onClose={onClose}
          onSelectEnvironment={handleSelectEnvironment}
          onChangeMode={handleChangeMode}
        />
      )}
    </>
  )
}
