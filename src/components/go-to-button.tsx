import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import { ChevronRight } from "lucide-react"

interface GoToProps {
  path: string
  params?: Record<string, string>
  search?: Record<string, unknown>
  label: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
}

export default function GoToButton({
  path,
  params,
  search,
  label,
  disabled = false,
  className,
  buttonClassName,
}: GoToProps): React.ReactElement {
  const navigate = useNavigate()

  const handleClick = async () => {
    await navigate({ to: path, params, search })
  }

  return (
    <div
      className={cn(
        "group/go-to-button flex h-6 min-w-0 gap-1",
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
        className={cn(
          "min-w-0 shrink text-primary group-hover/go-to-button:text-primary/80",
          buttonClassName,
        )}
        aria-label={label}
      >
        <span className="truncate">{label}</span>
      </Button>
      <div className="flex h-full shrink-0 items-center">
        <ChevronRight className="mt-0.5 size-3.5 text-primary transition-all duration-200 group-hover/go-to-button:translate-x-2 group-hover/go-to-button:text-primary!" />
      </div>
    </div>
  )
}
