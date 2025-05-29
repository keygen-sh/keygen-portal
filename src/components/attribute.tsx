import { Badge, BadgeVariant } from "@/components/ui/badge"

interface AttributeProps {
  label: string
  value: string
  variant?: BadgeVariant
}

export default function Attribute({
  label,
  value,
  variant = "default",
}: AttributeProps): React.ReactElement {
  return (
    <div className="flex w-full justify-between">
      <p className="text-sm text-content-normal">{label}</p>
      <Badge className="text-sm" variant={variant}>
        {value}
      </Badge>
    </div>
  )
}
