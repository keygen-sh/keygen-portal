import { forwardRef, useMemo } from "react"
import { Copy } from "lucide-react"

import { copyToClipboard } from "@/lib/clipboard"
import { truncator, TruncateStyle } from "@/lib/truncate"

interface ClipboardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  truncate?: boolean
  truncateStyle?: TruncateStyle
  maxLength?: number
}

const ClipboardButton = forwardRef<HTMLDivElement, ClipboardButtonProps>(
  (
    {
      value,
      truncate = true,
      truncateStyle = "clip",
      maxLength = 8,
      className,
      ...props
    },
    ref,
  ) => {
    const format = useMemo(
      () => truncator(truncateStyle, { maxLength }),
      [truncateStyle, maxLength],
    )

    const display = truncate ? format(value) : value

    return (
      <div
        ref={ref}
        {...props}
        onClick={async (e) => {
          e.stopPropagation()
          await copyToClipboard(value)
          props.onClick?.(e)
        }}
        className={
          "group inline-flex w-[var(--width)] items-center text-content-muted " +
          (className ?? "")
        }
        style={
          {
            "--width": `calc(${display.length}ch + 4ch + 1rem)`,
          } as React.CSSProperties
        }
      >
        <span className="inline-flex cursor-pointer items-center rounded-sm bg-content-subdued/30 px-2 py-0.5 font-mono text-content-muted">
          {display}
          <span className="inline-flex w-0 overflow-hidden transition-[width] duration-200 group-hover:w-5">
            <Copy className="ml-2 h-3 w-3 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </span>
        </span>
      </div>
    )
  },
)

ClipboardButton.displayName = "ClipboardButton"
export default ClipboardButton
