import { useState, useMemo } from "react"
import { useFormState } from "react-hook-form"

import { Switch } from "@/components/ui/switch"

import { extractFromChildren } from "@/lib/react"

interface FormsSectionToggledProps {
  children: React.ReactNode
  label?: string
}

export default function FormsSectionToggled({
  label,
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

  const { errors } = useFormState({ name: fields })

  const hasFieldErrors = fields.some((f) => {
    const parts = f.split(".")
    let current: unknown = errors
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, unknown>)[part]
      } else {
        current = undefined
        break
      }
    }
    return !!current
  })

  const open = showAdvanced || hasFieldErrors

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
