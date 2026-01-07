import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import { ChevronRight } from "lucide-react"

interface GoToProps {
  path: string
  params?: Record<string, string>
  label: string
  className?: string
}

export default function GoToButton({
  path,
  params,
  label,
  className,
}: GoToProps): React.ReactElement {
  const navigate = useNavigate()

  const handleClick = async () => {
    await navigate({ to: path, params })
  }

  return (
    <div className={cn("group flex h-6 w-fit gap-1", className)}>
      <Button
        type="button"
        variant="link"
        size="link"
        onClick={handleClick}
        className="text-primary group-hover:text-primary/80"
        aria-label={label}
      >
        {label}
      </Button>
      <div className="flex h-full items-center">
        <ChevronRight className="mt-0.5 size-3.5 text-primary transition-all duration-200 group-hover:translate-x-2" />
      </div>
    </div>
  )
}
