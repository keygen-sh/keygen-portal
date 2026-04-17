import * as React from "react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import { useBackNavigate } from "@/hooks/use-back-navigate"

import { ChevronLeft } from "lucide-react"

interface BackProps {
  path?: string
  label?: string
  className?: string
}

export default function BackButton({
  label,
  className,
}: BackProps): React.ReactElement {
  const back = useBackNavigate()

  return (
    <div className={cn("group flex h-6 w-fit gap-2", className)}>
      <div className="flex h-full items-center">
        <ChevronLeft className="mt-0.5 size-3.5 text-content-subdued transition-all duration-200 group-hover:-translate-x-2 group-hover:text-brand-primary" />
      </div>
      <Button
        type="button"
        variant="link"
        size="link"
        onClick={() => back()}
        className="text-content-subdued group-hover:text-content-muted"
        aria-label={label || "Go Back"}
      >
        {label || "Go Back"}
      </Button>
    </div>
  )
}
