import { forwardRef } from "react"
import { Copy } from "lucide-react"
import { copyToClipboard } from "@/lib/clipboard"

interface ClipboardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  truncate?: boolean
}

const ClipboardButton = forwardRef<HTMLDivElement, ClipboardButtonProps>(
  ({ value, truncate = true, className, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        copyToClipboard(value)
        props.onClick?.(e)
      }}
      className={
        "group inline-flex w-24 items-center text-content-muted " +
        (className ?? "")
      }
    >
      <span className="inline-flex max-w-[calc(8ch+1rem)] items-center overflow-hidden rounded-sm bg-content-subdued/30 px-2 py-0.5 text-content-muted transition-[max-width] duration-200 group-hover:max-w-[calc(8ch+4ch+1rem)]">
        {truncate ? value.slice(0, 8) : value}
        <Copy className="ml-2 min-h-3 min-w-3 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
    </div>
  ),
)

ClipboardButton.displayName = "ClipboardButton"
export default ClipboardButton
