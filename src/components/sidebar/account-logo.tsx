import { useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"
import { logoDevImageUrl, getInitials } from "@/lib/logo"

const BASE_STYLES = "size-8 shrink-0 rounded-sm"

export function AccountLogo({
  name,
  className,
}: {
  name?: string | null
  className?: string
}): React.ReactElement {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [erroredSrc, setErroredSrc] = useState<string | null>(null)

  if (!name) {
    return <Skeleton className={cn(BASE_STYLES, className)} />
  }

  const candidate = logoDevImageUrl(name)
  const src = candidate && candidate !== erroredSrc ? candidate : null

  if (src) {
    const loaded = loadedSrc === src
    return (
      <>
        {!loaded && <Skeleton className={cn(BASE_STYLES, className)} />}
        <img
          src={src}
          alt=""
          className={cn(
            BASE_STYLES,
            "size-6 object-contain",
            !loaded && "hidden",
            className,
          )}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setErroredSrc(src)}
        />
      </>
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        BASE_STYLES,
        "flex items-center justify-center bg-background-4 text-base font-medium text-white",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
