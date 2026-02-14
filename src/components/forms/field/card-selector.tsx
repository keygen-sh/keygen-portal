import { cn } from "@/lib/utils"

interface CardSelectorProps {
  title?: string
  multiselect?: boolean
  children: React.ReactNode
  className?: string
}

export default function CardSelector({
  title,
  multiselect,
  children,
  className,
}: CardSelectorProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <div className="flex justify-between">
        {title && (
          <h2 className="mr-4 font-owners-wide text-sm font-medium tracking-wider text-content-normal uppercase">
            {title}
          </h2>
        )}
        <span className="font-owners-text text-xs font-normal tracking-wider text-content-subdued uppercase">
          {multiselect ? "Select all that apply" : "Select one"}
        </span>
      </div>
      {children}
    </div>
  )
}
