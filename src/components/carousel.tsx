import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { Button } from "@/components/ui/button"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { useMobile } from "@/hooks/use-mobile"

const GAP = 16

interface CarouselProps {
  scrollToIndex?: number
  children: React.ReactNode
  className?: string
}

export default function Carousel({
  children,
  scrollToIndex,
  className,
}: CarouselProps) {
  const isMobile = useMobile()

  const childArray = React.Children.toArray(children)
  const itemCount = childArray.length

  const [scrollOffset, setScrollOffset] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [itemWidths, setItemWidths] = useState<number[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const itemOffsets = useMemo(() => {
    const offsets = [0]
    for (let i = 0; i < itemWidths.length; i++) {
      offsets.push(offsets[i] + itemWidths[i] + GAP)
    }
    return offsets
  }, [itemWidths])

  const totalWidth =
    itemWidths.length > 0 ? itemOffsets[itemWidths.length] - GAP : 0
  const allVisible = itemWidths.length === 0 || availableWidth >= totalWidth
  const maxOffset = Math.max(0, totalWidth - availableWidth)
  const effectiveOffset = Math.max(0, Math.min(scrollOffset, maxOffset))

  const canScrollLeft = effectiveOffset > 0
  const canScrollRight = !allVisible && effectiveOffset < maxOffset

  const measureItems = useCallback(() => {
    const widths = itemRefs.current
      .slice(0, itemCount)
      .map((el) => el?.offsetWidth ?? 0)
    if (widths.length > 0 && widths.some((w) => w > 0)) {
      setItemWidths(widths)
    }
  }, [itemCount])

  const measureWidths = useCallback(() => {
    if (containerRef.current) {
      setAvailableWidth(containerRef.current.getBoundingClientRect().width)
    }
  }, [])

  useLayoutEffect(() => {
    measureItems()
    measureWidths()
  }, [children, measureItems, measureWidths])

  useEffect(() => {
    const container = containerRef.current
    function measure() {
      measureWidths()
      measureItems()
    }
    const observer = new ResizeObserver(measure)
    if (container) observer.observe(container)
    return () => observer.disconnect()
  }, [measureItems, measureWidths])

  useEffect(() => {
    itemRefs.current.length = itemCount
  }, [itemCount])

  const appliedScrollTo = useRef<number | null>(null)

  useEffect(() => {
    if (scrollToIndex == null) {
      appliedScrollTo.current = null
      return
    }
    if (itemWidths.length === 0 || scrollToIndex >= itemWidths.length) return
    if (appliedScrollTo.current === scrollToIndex) return
    appliedScrollTo.current = scrollToIndex

    const left = itemOffsets[scrollToIndex]
    const right = left + itemWidths[scrollToIndex]

    setScrollOffset((prev) => {
      const offset = Math.max(0, Math.min(prev, maxOffset))

      if (left < offset) {
        return left
      }
      if (right > offset + availableWidth) {
        return Math.min(right - availableWidth, maxOffset)
      }

      return prev
    })
  }, [scrollToIndex, itemWidths, itemOffsets, availableWidth, maxOffset])

  function scrollLeft() {
    const target = itemOffsets.findLast((o) => o < effectiveOffset)
    setScrollOffset(target ?? 0)
  }

  function scrollRight() {
    const target = itemOffsets.find((o) => o > effectiveOffset)
    setScrollOffset(Math.min(target ?? maxOffset, maxOffset))
  }

  if (isMobile) {
    return (
      <div
        className={cn(
          "flex flex-col gap-4 rounded border border-accent p-4",
          className,
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        className="size-8 shrink-0 text-content-subdued"
        disabled={!canScrollLeft}
        onClick={scrollLeft}
      >
        <ChevronLeft className="size-5" />
      </Button>

      <div className="min-w-0 flex-1 rounded border border-accent p-4">
        <div
          className="relative min-w-0 overflow-hidden"
          onScroll={(event) => {
            const el = event.currentTarget
            if (el.scrollLeft > 0) {
              const shifted = el.scrollLeft
              el.scrollLeft = 0
              setScrollOffset((prev) => prev + shifted)
            }
          }}
        >
          <div ref={containerRef} style={{ contain: "inline-size" }}>
            <div
              className="flex items-stretch gap-4"
              style={{
                transform: `translateX(-${effectiveOffset}px)`,
                transition: "transform 300ms ease",
                width: "max-content",
              }}
            >
              {childArray.map((child, i) => (
                <div
                  key={React.isValidElement(child) ? (child.key ?? i) : i}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                >
                  {child}
                </div>
              ))}
            </div>
          </div>

          {/* scroll gradient overlays */}
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background/50 to-transparent transition-opacity duration-300 md:w-12",
              canScrollLeft ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background/50 to-transparent transition-opacity duration-300 md:w-12",
              canScrollRight ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="size-8 shrink-0 text-content-subdued"
        disabled={!canScrollRight}
        onClick={scrollRight}
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  )
}
