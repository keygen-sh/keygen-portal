import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import { ChevronRight } from "lucide-react"

interface GoToProps {
  path: string
  params?: Record<string, string>
  label: string
  disabled?: boolean
  className?: string
}

export default function GoToButton({
  path,
  params,
  label,
  disabled = false,
  className,
}: GoToProps): React.ReactElement {
  const navigate = useNavigate()

  const handleClick = async () => {
    await navigate({ to: path, params })
  }

  return (
    <div
      className={cn(
        "group flex h-6 min-w-0 gap-1",
        disabled && "pointer-events-none",
        className,
      )}
    >
      <Button
        type="button"
        variant="link"
        size="link"
        onClick={handleClick}
        disabled={disabled}
        className="min-w-0 shrink text-primary group-hover:text-primary/80"
        aria-label={label}
      >
        <span className="truncate">{label}</span>
      </Button>
      <div className="flex h-full shrink-0 items-center">
        <ChevronRight className="mt-0.5 size-3.5 text-primary transition-all duration-200 group-hover:translate-x-2 group-hover:text-primary!" />
      </div>
    </div>
  )
}
