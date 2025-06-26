import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttributeArrayProps {
  label: string
  array: string[]
  tooltip?: React.ReactNode
  className?: string
}

export default function AttributeArray({
  label,
  array,
  tooltip,
  className,
}: AttributeArrayProps): React.ReactElement {
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

      <div className="flex max-w-full flex-wrap gap-2">
        {array.map((value, index) => (
          <Badge key={index} className={cn("text-sm", className)}>
            {value}
          </Badge>
        ))}
      </div>
    </div>
  )
}
