import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface CardSelectorProps {
  title?: string
  optional?: boolean
  multiselect?: boolean
  children: React.ReactNode
  className?: string
}

export default function CardSelector({
  title,
  optional = false,
  multiselect,
  children,
  className,
}: CardSelectorProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {title && (
            <h2 className="font-owners-wide text-sm font-medium tracking-wider text-content-normal uppercase">
              {title}
            </h2>
          )}
          <Separator orientation="vertical" />
          <span className="font-owners-text text-xs font-normal tracking-wider text-content-subdued uppercase">
            {multiselect ? "Select all that apply" : "Select one"}
          </span>
        </div>
        {optional && (
          <span className="text-xs text-content-subdued">Optional</span>
        )}
      </div>
      {children}
    </div>
  )
}
