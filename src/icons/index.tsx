import type { CSSProperties, SVGProps } from "react"

import {
  siNpm,
  siPypi,
  siRubygems,
  siTauri,
  type SimpleIcon,
} from "simple-icons"

// Renders a simple-icons icon object as an SVG component. The icon's brand
// color is exposed as a `--brand` CSS variable, e.g. for hover styling via
// `group-hover:text-(--brand)`.
function createBrandIcon(icon: SimpleIcon) {
  function BrandIcon({ style, ...props }: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        style={{ "--brand": `#${icon.hex}`, ...style } as CSSProperties}
        {...props}
      >
        <path d={icon.path} />
      </svg>
    )
  }
  BrandIcon.displayName = icon.title
  return BrandIcon
}

export const Npm = createBrandIcon(siNpm)
export const PyPi = createBrandIcon(siPypi)
export const RubyGems = createBrandIcon(siRubygems)
export const Tauri = createBrandIcon(siTauri)
