import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import * as keygen from "@/keygen/index"

interface BackProps {
  path: string
  label?: string
  className?: string
}

/**
 * Renders a back button based on shadcn button, with a label and path to navigate back to.
 */
export default function BackButton({
  path,
  label,
  className,
}: BackProps): React.ReactElement {
  return (
    <Button
      variant="link"
      size="link"
      className={cn("text-content-subdued", className)}
      asChild
    >
      <Link to={path} params={{ id: keygen.config.id }} aria-label={label}>
        <svg
          className="mt-0.5 h-6 w-6"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M13 5H1m0 0 4 4M1 5l4-4"
          />
        </svg>
        {label || "Go Back"}
      </Link>
    </Button>
  )
}
