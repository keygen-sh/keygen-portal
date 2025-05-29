import { useState, useCallback } from "react"

import { Environment } from "@/types/environments"
import { MODES } from "@/constants/environments"

import * as View from "@/components/environments/view/index"
import * as Edit from "@/components/environments/edit/index"
import * as Create from "@/components/environments/create/index"

interface EnvironmentsModalManagerProps {
  open: boolean
  onClose: () => void
}

export default function EnvironmentsModalManager({
  open,
  onClose,
}: EnvironmentsModalManagerProps): React.ReactElement {
  const [mode, setMode] = useState<MODES>(MODES.VIEW)
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<Environment | null>(null)

  const handleSelectEnvironment = useCallback(
    (environment: Environment | null) => {
      setSelectedEnvironment(environment)
    },
    [],
  )

  const handleChangeMode = useCallback((newMode: MODES) => {
    setMode(newMode)
  }, [])

  return (
    <>
      {mode === MODES.VIEW && (
        <View.Modal
          open={open}
          onClose={onClose}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={handleSelectEnvironment}
          onChangeMode={handleChangeMode}
        />
      )}
      {mode === MODES.EDIT && selectedEnvironment && (
        <Edit.Modal
          open={open}
          onClose={onClose}
          selectedEnvironment={selectedEnvironment}
          onSelectEnvironment={handleSelectEnvironment}
          onChangeMode={handleChangeMode}
        />
      )}
      {mode === MODES.CREATE && (
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
