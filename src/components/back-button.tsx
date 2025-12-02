import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import { ChevronLeft } from "lucide-react"

interface BackProps {
  path: string
  label?: string
  className?: string
  preferHistory?: boolean
}

export default function BackButton({
  path,
  label,
  className,
  preferHistory = true,
}: BackProps): React.ReactElement {
  const navigate = useNavigate()

  const handleClick = async () => {
    if (preferHistory && window.history.length > 1) {
      window.history.back()
      return
    }
    await navigate({ to: path })
  }

  return (
    <div className={cn("group flex h-6 w-fit gap-2", className)}>
      <div className="flex h-full items-center">
        <ChevronLeft className="mt-0.5 size-3.5 text-content-subdued transition-all duration-200 group-hover:-translate-x-2 group-hover:text-brand-primary" />
      </div>
      <Button
        type="button"
        variant="link"
        size="link"
        onClick={handleClick}
        className="text-content-subdued group-hover:text-content-muted"
        aria-label={label || "Go Back"}
      >
        {label || "Go Back"}
      </Button>
    </div>
  )
}
