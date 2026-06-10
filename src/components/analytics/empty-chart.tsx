import { cn } from "@/lib/utils"

export default function EmptyChart({
  message = "No analytics data for this range.",
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-56 items-center justify-center rounded-md text-sm text-content-subdued",
        className,
      )}
    >
      {message}
    </div>
  )
}
