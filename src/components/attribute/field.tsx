import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

type AttributeVariant = "default" | "outline" | "text" | "none" | "stacking"

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
  const renderVariant = () => {
    switch (variant) {
      case "none":
      case "stacking":
        return value
      case "text":
        return <span className={cn("px-2 text-sm", className)}>{value}</span>
      case "outline":
        return (
          <Badge
            variant="outline"
            className={cn("px-2 text-sm text-content-muted", className)}
          >
            {value}
          </Badge>
        )
      default:
        return <Badge className={cn("text-sm", className)}>{value}</Badge>
    }
  }

  return (
    <div
      className={cn(
        "flex w-full",
        variant === "stacking"
          ? "flex-col gap-2"
          : "items-start justify-between",
      )}
    >
      <div className="flex items-center gap-2">
        <p className="text-sm text-content-normal">{label}</p>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 self-center text-content-subdued" />
            </TooltipTrigger>
            <TooltipContent className="max-w-80 bg-background-4 text-pretty whitespace-pre-line text-content-muted">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {renderVariant()}
    </div>
  )
}
