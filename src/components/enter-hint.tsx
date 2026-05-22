import { cn } from "@/lib/utils"

export const ENTER_HINT_SELECTED_ROW_CLASS =
  "bg-accent text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground"

export interface EnterHintProps {
  visible?: boolean
  className?: string
}

export default function EnterHint({
  visible = false,
  className,
}: EnterHintProps) {
  return (
    <kbd
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-[3px] border-t border-content-subdued bg-background-5 px-1 font-mono text-[10px] leading-none text-nowrap text-content-muted opacity-0",
        visible && "opacity-100",
        className,
      )}
    >
      Enter
    </kbd>
  )
}
