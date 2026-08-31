import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

import { toggleFavoriteCommand } from "@/hooks/use-favorites"

export interface FavoriteProps {
  commandId: string
  isFavorite: boolean
  className?: string
}

export default function Favorite({
  commandId,
  isFavorite,
  className,
}: FavoriteProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavoriteCommand(commandId)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") e.stopPropagation()
      }}
      className={cn(
        "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-content-subdued outline-none hover:text-content-loud focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Star
        className={cn("size-4! text-current", isFavorite && "fill-current")}
      />
    </button>
  )
}
