import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { FilterBarContext } from "@/contexts/filter-bar-context"

const GAP = 8 // gap-2

export interface FilterBarProps {
  // count of currently active filters (drives the "clear all" badge's display)
  filterCount?: number
  // callback when the user clicks the "clear all" badge
  onClearAll?: () => void
  // slot for pinned filters rendered before the scroll region
  pinned?: React.ReactNode
  // scrollable filter children
  children: React.ReactNode
}

export default function FilterBar({
  filterCount,
  onClearAll,
  pinned,
  children,
}: FilterBarProps) {
  const childArray = React.Children.toArray(children)
  const scrollableCount = childArray.length

  // remeasure trigger
  const [measureTick, setMeasureTick] = useState(0)
  const remeasure = useCallback(() => setMeasureTick((t) => t + 1), [])

  // horizontal scroll (pixel-offset based, i.e. scroll position only changes on user
  // interaction, not e.g. when filter widths change from filter state changes)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [itemWidths, setItemWidths] = useState<number[]>([])

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
      .slice(0, scrollableCount)
      .map((el) => el?.offsetWidth ?? 0)
    if (widths.length > 0 && widths.some((w) => w > 0)) {
      setItemWidths(widths)
    }
  }, [scrollableCount])

  // scroll the last item into view when only it changed width (e.g. inactive -> draft)
  const prevItemWidths = useRef<number[]>([])

  useLayoutEffect(() => {
    const prev = prevItemWidths.current
    const next = itemWidths

    // detect when only the last item changed width (e.g. inactive -> draft)
    const lastChanged =
      prev.length > 0 &&
      next.length > 0 &&
      prev[prev.length - 1] !== next[next.length - 1]
    const restUnchanged =
      prev.length === next.length &&
      prev.slice(0, -1).every((w, i) => w === next[i])

    if (lastChanged && restUnchanged && maxOffset > 0) {
      // scroll the last item into view (if already at the end then stay pinned,
      // otherwise jump to the end so the newly-drafted filter is visible)
      setScrollOffset(maxOffset)
    }

    prevItemWidths.current = itemWidths
  }, [itemWidths, maxOffset])

  useLayoutEffect(() => {
    measureItems()
    const container = containerRef.current
    if (container) {
      setAvailableWidth(container.getBoundingClientRect().width)
    }
  }, [children, measureItems, measureTick])

  useEffect(() => {
    const container = containerRef.current
    function measure() {
      if (container) {
        setAvailableWidth(container.getBoundingClientRect().width)
      }
      measureItems()
    }
    const observer = new ResizeObserver(measure)
    if (container) observer.observe(container)
    return () => observer.disconnect()
  }, [measureItems])

  // truncate stale refs when children count changes
  useEffect(() => {
    itemRefs.current.length = scrollableCount
  }, [scrollableCount])

  function scrollLeft() {
    const target = itemOffsets.findLast((o) => o < effectiveOffset)
    setScrollOffset(target ?? 0)
  }

  function scrollRight() {
    const target = itemOffsets.find((o) => o > effectiveOffset)
    setScrollOffset(Math.min(target ?? maxOffset, maxOffset))
  }

  const contextValue = useMemo(() => ({ remeasure }), [remeasure])

  return (
    <FilterBarContext.Provider value={contextValue}>
      <div className="relative z-50 flex h-6 w-full items-center gap-2 overflow-hidden">
        {/* pinned slot */}
        {pinned}

        {/* scroll arrows */}
        <div className="flex shrink-0 items-center gap-0.5 text-content-subdued">
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            disabled={!canScrollLeft}
            onClick={scrollLeft}
          >
            <ChevronLeft className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            disabled={!canScrollRight}
            onClick={scrollRight}
          >
            <ChevronRight className="size-3" />
          </Button>
        </div>

        {/* scroll region */}
        <div className="relative h-full min-w-0 flex-1 overflow-hidden pr-1">
          <div
            ref={containerRef}
            className="h-full"
            style={{ contain: "inline-size" }}
          >
            <div
              className="flex h-full items-center gap-2"
              style={{
                transform: `translateX(-${effectiveOffset}px)`,
                transition: "transform 300ms ease",
                width: "max-content",
              }}
            >
              {childArray.map((child, i) => (
                <div
                  key={React.isValidElement(child) ? (child.key ?? i) : i}
                  className="h-full"
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                >
                  {child}
                </div>
              ))}
            </div>
          </div>

          {/* left scroll indicator */}
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background/50 to-transparent transition-opacity duration-300 md:w-12",
              canScrollLeft ? "opacity-100" : "opacity-0",
            )}
          />

          {/* right scroll indicator */}
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background/50 to-transparent transition-opacity duration-300 md:w-12",
              canScrollRight ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        {/* filter count badge */}
        {filterCount != null && filterCount > 0 && (
          <button
            type="button"
            className="group inline-flex h-full shrink-0 cursor-pointer items-center gap-1 rounded-[3px] bg-brand-amber/20 px-1.5 text-xs font-normal whitespace-nowrap text-brand-amber transition-colors hover:bg-destructive/20 hover:text-destructive"
            onClick={onClearAll}
          >
            {filterCount} {filterCount === 1 ? "filter" : "filters"} applied
            <X className="size-3 w-0 overflow-hidden transition-all group-hover:w-3" />
          </button>
        )}
      </div>
    </FilterBarContext.Provider>
  )
}
