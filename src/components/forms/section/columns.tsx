import { Children, isValidElement, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface FormsSectionColumnsProps {
  title?: string
  children: ReactNode
  className?: string
}

export default function FormsSectionColumns({
  title,
  children,
  className,
}: FormsSectionColumnsProps) {
  const columns: ReactNode[] = []
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      columns.push(child)
    }
  })

  return (
    <div>
      {title && (
        <h2 className="pb-4 font-medium text-content-loud/90">{title}</h2>
      )}

      <div className={cn("flex flex-col gap-4 md:flex-row", className)}>
        {columns.map((column, index) => (
          <div key={index} className="flex flex-1 gap-4 md:flex-row">
            {column}
            {index < columns.length - 1 && (
              <div className="mx-4 hidden md:block">
                <Separator orientation="vertical" dashed />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
