import { useState } from "react"

import { cn, splitLastWord } from "@/lib/utils"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { Info } from "lucide-react"

import { useMobile } from "@/hooks/use-mobile"

import * as Motion from "@/components/motion"

type PropertyFieldVariant = "default" | "reverse"
type EmptyCase = (value: React.ReactNode) => boolean

interface PropertyFieldProps {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  variant?: PropertyFieldVariant
  value: React.ReactNode
  hoverValue?: React.ReactNode
  tooltip?: React.ReactNode
  suffix?: React.ReactNode
  isEmpty?: EmptyCase
  emptyLabel?: string
  className?: string
}

const defaultIsEmpty: EmptyCase = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "")

export default function PropertyField({
  icon: Icon,
  label,
  variant = "default",
  value,
  hoverValue,
  tooltip,
  suffix,
  isEmpty = defaultIsEmpty,
  emptyLabel = "--",
  className,
}: PropertyFieldProps): React.ReactElement {
  const isMobile = useMobile()
  const [hovered, setHovered] = useState(false)

  const fieldClassName = cn(
    "group/property-field flex items-center",
    hoverValue != null && "group-hover/property-field:flex-wrap",
    (hoverValue != null || tooltip) &&
      "-mx-1.5 -my-1 cursor-default px-1.5 py-1",
  )

  const tooltipSpace = tooltip ? (
    <span className="hidden [word-spacing:0.25em] group-hover/property-field:inline group-data-[state=delayed-open]/property-field:inline group-data-[state=open]/property-field:inline">
      {" "}
    </span>
  ) : null

  const tooltipIcon = tooltip ? (
    <span className="inline-flex w-0 shrink-0 align-middle transition-[width] duration-200 group-hover/property-field:w-3 group-data-[state=delayed-open]/property-field:w-3 group-data-[state=open]/property-field:w-3">
      <Info
        aria-hidden
        className="inline size-3 translate-x-2 self-center text-content-subdued opacity-0 transition-all duration-200 group-hover/property-field:translate-x-0 group-hover/property-field:opacity-100 group-data-[state=delayed-open]/property-field:translate-x-0 group-data-[state=delayed-open]/property-field:opacity-100 group-data-[state=open]/property-field:translate-x-0 group-data-[state=open]/property-field:opacity-100"
      />
    </span>
  ) : null

  const suffixSlot = suffix ? (
    <span className="inline-flex align-middle [&_[data-slot=badge]]:ml-0">
      {suffix}
    </span>
  ) : null

  const renderReverseText = (displayValue: React.ReactNode) => {
    const { head, tail } = splitLastWord(label)

    return (
      <>
        <span className={cn("text-content-loud", className)}>
          {displayValue}
        </span>{" "}
        {head && <span className="text-content-muted">{head} </span>}
        <span className="text-content-muted">{tail}</span>
        {tooltipSpace}
        {tooltipIcon}
        {suffixSlot && <> {suffixSlot}</>}
      </>
    )
  }

  const renderDefaultText = (displayValue: React.ReactNode) => {
    if (typeof displayValue !== "string" && typeof displayValue !== "number") {
      return (
        <>
          <span className="text-content-muted">{label}</span>{" "}
          <span className={cn("text-content-loud", className)}>
            {displayValue}
          </span>
          {tooltipSpace}
          {tooltipIcon}
          {suffixSlot && <> {suffixSlot}</>}
        </>
      )
    }

    const { head, tail } = splitLastWord(String(displayValue))

    return (
      <>
        <span className="text-content-muted">{label}</span>{" "}
        {head && (
          <span className={cn("text-content-loud", className)}>{head} </span>
        )}
        <span className={cn("text-content-loud", className)}>{tail}</span>
        {tooltipSpace}
        {tooltipIcon}
        {suffixSlot && <> {suffixSlot}</>}
      </>
    )
  }

  const renderValue = (baseClassName: string) =>
    hoverValue == null ? (
      <span className={cn(baseClassName, className)}>{value}</span>
    ) : (
      <Motion.Text
        className="text-xs"
        wrap={hovered}
        value={
          variant === "reverse"
            ? renderReverseText(value)
            : renderDefaultText(value)
        }
        hoverValue={
          variant === "reverse"
            ? renderReverseText(hoverValue)
            : renderDefaultText(hoverValue)
        }
        hovered={hovered}
      />
    )

  const renderVariant = () => {
    switch (variant) {
      case "reverse":
        return (
          <div
            className={fieldClassName}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {Icon && (
              <Icon className="mt-1 mr-2 size-3.5 shrink-0 text-content-normal" />
            )}
            {isEmpty(value) ? (
              <>
                <p className="text-xs text-content-normal">{emptyLabel}</p>
                {tooltipIcon}
              </>
            ) : (
              <>
                {renderValue("mr-1 text-xs text-content-loud")}
                {hoverValue == null && (
                  <p className="text-xs text-content-muted">{label}</p>
                )}
                {hoverValue == null && tooltipIcon}
                {hoverValue == null && suffixSlot}
              </>
            )}
          </div>
        )
      default:
        return (
          <div
            className={fieldClassName}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {Icon && (
              <Icon className="mt-1 mr-2 size-3.5 shrink-0 text-content-normal" />
            )}
            {isEmpty(value) ? (
              <>
                <p className="text-xs text-content-muted">{label}</p>
                <span
                  className={cn("ml-1 text-xs text-content-loud", className)}
                >
                  {value}
                </span>
                {tooltipIcon}
              </>
            ) : (
              <>
                {hoverValue == null && (
                  <p className="text-xs text-content-muted">{label}</p>
                )}
                {renderValue("ml-1 text-xs text-content-loud")}
                {hoverValue == null && tooltipIcon}
                {hoverValue == null && suffixSlot}
              </>
            )}
          </div>
        )
    }
  }

  const field = renderVariant()

  if (!tooltip) return field

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>{field}</PopoverTrigger>
        <PopoverContent className="mr-2 max-w-72 bg-accent text-pretty text-content-loud">
          {tooltip}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>{field}</TooltipTrigger>
      <TooltipContent
        side="left"
        sideOffset={8}
        className="pointer-events-none max-w-72 bg-accent text-pretty text-content-loud"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
