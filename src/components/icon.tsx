import * as React from "react"
import { icons } from "@/constants/icons"
import { cn } from "@/lib/utils"

type IconName = keyof typeof icons

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  className?: string
}

/**
 * Renders an SVG icon from `icons.ts` that can be styled.
 */
export default function Icon({
  name,
  className,
  ...props
}: IconProps): React.ReactElement {
  const SvgIcon = icons[name]

  return (
    <SvgIcon
      className={cn("size-5 text-content-subdued", className)}
      {...props}
    />
  )
}
