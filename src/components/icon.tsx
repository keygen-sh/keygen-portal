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
 *
 * @param {string} name - The name of the icon to render. Should match a key in the `icons` object
 * @param {string} className - Additional classes
 * @param {React.SVGProps<SVGSVGElement>} props - Additional SVG props
 * @returns {JSX.Element} The rendered SVG icon
 */
export default function Icon({ name, className, ...props }: IconProps) {
  const SvgIcon = icons[name]

  return (
    <SvgIcon
      className={cn("size-5 text-content-subdued", className)}
      {...props}
    />
  )
}
