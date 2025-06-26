import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

type AttributeVariant = "default" | "outline" | "plain"

interface AttributeFieldProps {
  label: string
  value: React.ReactNode
  variant?: AttributeVariant
  tooltip?: React.ReactNode
  className?: string
}

export default function AttributeField({
  label,
  value,
  variant = "default",
  tooltip,
  className,
}: AttributeFieldProps): React.ReactElement {
  const renderValue = () => {
    switch (variant) {
      case "plain":
        return <span className={cn("text-sm", className)}>{value}</span>
      case "outline":
        return (
          <Badge variant="outline" className={cn("text-sm", className)}>
            {value}
          </Badge>
        )
      default:
        return <Badge className={cn("text-sm", className)}>{value}</Badge>
    }
  }

  return (
    <div className="flex w-full items-start justify-between">
      <div className="flex items-center gap-2">
        <p className="text-sm text-content-normal">{label}</p>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="mt-1 size-3.5 text-content-subdued" />
            </TooltipTrigger>
            <TooltipContent className="max-w-80 bg-background-4 text-content-muted">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {renderValue()}
    </div>
  )
}
