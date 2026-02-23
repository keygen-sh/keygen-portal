import { useState, useMemo } from "react"
import { type FieldValues, useFormContext, useFormState } from "react-hook-form"

import { Switch } from "@/components/ui/switch"

import { extractFromChildren } from "@/lib/react"

interface FormsSectionToggledProps {
  label?: string
  children: React.ReactNode
}

export default function FormsSectionToggled({
  label = "Advanced configuration",
  children,
}: FormsSectionToggledProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const fields = useMemo(
    () =>
      extractFromChildren(
        children,
        (props) =>
          Array.isArray(props.include) ? (props.include as string[]) : null,
        { recursive: true },
      ).flat(),
    [children],
  )

  const { control, getFieldState } = useFormContext<FieldValues>()
  const state = useFormState({ control, name: fields })

  // Keep the section open when any field is invalid so the user can see and fix it
  const open =
    showAdvanced || fields.some((name) => getFieldState(name, state).invalid)

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center">
        <Switch checked={open} onCheckedChange={setShowAdvanced} />
        <span className="ml-2 font-owners-text text-sm font-medium text-content-muted">
          {label}
        </span>
      </div>
      {open && children}
    </div>
  )
}
