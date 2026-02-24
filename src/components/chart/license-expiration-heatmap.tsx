import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { format, parseISO } from "date-fns"

import { Skeleton } from "@/components/ui/skeleton"

import {
  ExpirationHeatmapEntry,
  ExpiringLicensesMockData,
  ExpirationHeatmapMockData,
} from "@/mock/metrics"

import * as keygen from "@/keygen"

import { cn } from "@/lib/utils"
import { truncateKey } from "@/lib/licenses"

import * as Chart from "@/components/chart"
import GoToButton from "@/components/go-to-button"

const DayLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"]
const CellWidth = 16
const CellHeight = 8
const CellGap = 2
const LabelWidth = 34

function toDisplayRow(y: number): number {
  return (y + 6) % 7
}

function getTemperatureColor(temperature: number): string {
  if (temperature === 0) return "var(--color-background-1)"
  if (temperature <= 0.25)
    return "color-mix(in srgb, var(--color-destructive) 30%, var(--color-background-1))"
  if (temperature <= 0.5)
    return "color-mix(in srgb, var(--color-destructive) 55%, var(--color-background-1))"
  if (temperature <= 0.75)
    return "color-mix(in srgb, var(--color-destructive) 80%, var(--color-background-1))"
  return "var(--color-destructive)"
}

export default function LicenseExpirationHeatmap() {
  // TODO(cazden) Refactor with query
  const licensesLoading = false

  const [expanded, setExpanded] = useState(false)
  const [hoveredEntry, setHoveredEntry] =
    useState<ExpirationHeatmapEntry | null>(null)

  const targetPosRef = useRef({ x: 0, y: 0 })
  const currentPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)

  const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const clearLingerTimer = useCallback(() => {
    if (lingerTimerRef.current) {
      clearTimeout(lingerTimerRef.current)
      lingerTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearLingerTimer()
    }
  }, [clearLingerTimer])

  // Resets all popover state back to closed
  const close = useCallback(() => {
    setExpanded(false)
    setHoveredEntry(null)
    clearLingerTimer()
  }, [clearLingerTimer])

  // Update tooltip target position while not expanded as cursor moves within the grid
  const handleGridMouseMove = (e: React.MouseEvent) => {
    if (!expanded) {
      targetPosRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleCellMouseEnter = (
    entry: ExpirationHeatmapEntry,
    e: React.MouseEvent,
  ) => {
    clearLingerTimer()

    // Close other expanded cells if any are open
    if (hoveredEntry?.date !== entry.date) {
      setExpanded(false)
    }

    const pos = { x: e.clientX, y: e.clientY }
    targetPosRef.current = pos

    // Snap tooltip to cursor on first hover so it doesn't lerp
    if (!hoveredEntry) {
      currentPosRef.current = { ...pos }
    }

    setHoveredEntry(entry)
  }

  // Short linger timer to allow cursor to move between cells without interrupting styles
  const handleCellMouseLeave = () => {
    if (!expanded) {
      lingerTimerRef.current = setTimeout(() => {
        close()
      }, 100)
    }
  }

  const handleCellClick = () => {
    setExpanded(true)
  }

  // Dismiss popover when clicked outside
  useEffect(() => {
    if (!expanded) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [expanded, close])

  // Interpolate the tooltip position toward the cursor while not expanded
  useEffect(() => {
    if (!hoveredEntry || expanded) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const loop = () => {
      const target = targetPosRef.current
      const current = currentPosRef.current
      const factor = 0.15

      current.x += (target.x - current.x) * factor
      current.y += (target.y - current.y) * factor

      if (Math.abs(target.x - current.x) < 0.5) current.x = target.x
      if (Math.abs(target.y - current.y) < 0.5) current.y = target.y

      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${current.x}px`
        tooltipRef.current.style.top = `${current.y}px`
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [hoveredEntry, expanded])

  // Derive grid layout metadata from the heatmap data
  const { monthLabels, numWeeks, occupiedCells } = useMemo(() => {
    if (!ExpirationHeatmapMockData?.length)
      return { monthLabels: [], numWeeks: 0, occupiedCells: new Set<string>() }

    let maxX = 0
    const occupied = new Set<string>()
    const monthFirstWeek = new Map<
      number,
      { label: string; weekIndex: number }
    >()

    for (const entry of ExpirationHeatmapMockData) {
      if (entry.x > maxX) maxX = entry.x
      occupied.add(`${entry.x},${toDisplayRow(entry.y)}`)

      // Track the earliest week each month appears in for label placement
      const date = parseISO(entry.date)
      const monthKey = date.getFullYear() * 12 + date.getMonth()
      const existing = monthFirstWeek.get(monthKey)
      if (!existing || entry.x < existing.weekIndex) {
        monthFirstWeek.set(monthKey, {
          label: format(date, "MMM"),
          weekIndex: entry.x,
        })
      }
    }

    const months = Array.from(monthFirstWeek.values()).sort(
      (a, b) => a.weekIndex - b.weekIndex,
    )

    return { monthLabels: months, numWeeks: maxX + 1, occupiedCells: occupied }
  }, [])

  return (
    <Chart.Card
      title="License expirations"
      isLoading={licensesLoading}
      action={
        <GoToButton
          path="/$accountId/app/licenses"
          params={{
            accountId: keygen.config.id,
          }}
          label="See more"
          className="[&_.group:hover_svg]:text-primary [&_button]:text-content-normal [&_button]:hover:text-content-loud [&_svg]:text-content-normal"
        />
      }
    >
      {ExpirationHeatmapMockData?.length ? (
        <div className="relative w-full overflow-x-auto">
          <div
            style={{ minWidth: LabelWidth + numWeeks * (CellWidth + CellGap) }}
          >
            <div
              onMouseMove={handleGridMouseMove}
              style={{
                display: "grid",
                gridTemplateColumns: `${LabelWidth}px repeat(${numWeeks}, ${CellWidth}px)`,
                gridTemplateRows: `auto repeat(7, ${CellHeight}px)`,
                columnGap: CellGap,
                rowGap: CellGap,
              }}
            >
              {monthLabels.map((month, index) => (
                <div
                  key={index}
                  className="flex flex-col text-[10px] text-content-subdued"
                  style={{ gridRow: 1, gridColumn: month.weekIndex + 2 }}
                >
                  <span>{month.label}</span>
                  <span className="mt-0.5 mb-1 h-1 w-px self-center bg-content-disabled" />
                </div>
              ))}

              {DayLabels.map((label, index) => (
                <div
                  key={index}
                  className="flex items-center text-[10px] leading-none text-content-subdued"
                  style={{ gridRow: index + 2, gridColumn: 1 }}
                >
                  {label}
                  {label && (
                    <span className="mr-1 ml-auto h-px w-1 bg-content-disabled" />
                  )}
                </div>
              ))}

              {Array.from({ length: numWeeks }, (_, weekIndex) =>
                Array.from({ length: 7 }, (_, dayIndex) => {
                  if (occupiedCells.has(`${weekIndex},${dayIndex}`)) return null
                  return (
                    <div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="bg-background-1"
                      style={{
                        gridRow: dayIndex + 2,
                        gridColumn: weekIndex + 2,
                      }}
                    />
                  )
                }),
              )}

              {ExpirationHeatmapMockData.map((entry) =>
                entry.count > 0 ? (
                  <div
                    key={entry.date}
                    onMouseEnter={(e) => handleCellMouseEnter(entry, e)}
                    onMouseLeave={handleCellMouseLeave}
                    onClick={handleCellClick}
                    className={cn(
                      "cursor-pointer transition-transform duration-150 ease-out hover:z-10 hover:scale-[1.3]",
                      hoveredEntry?.date === entry.date && "z-10 scale-[1.3]",
                    )}
                    style={{
                      gridRow: toDisplayRow(entry.y) + 2,
                      gridColumn: entry.x + 2,
                      backgroundColor: getTemperatureColor(entry.temperature),
                    }}
                  />
                ) : (
                  <div
                    key={entry.date}
                    style={{
                      gridRow: toDisplayRow(entry.y) + 2,
                      gridColumn: entry.x + 2,
                      backgroundColor: getTemperatureColor(entry.temperature),
                    }}
                  />
                ),
              )}
            </div>

            {/* Temperature legend */}
            <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-content-subdued">
              <span>Less</span>
              {[0, 0.25, 0.5, 0.75, 1].map((temperature) => (
                <div
                  key={temperature}
                  style={{
                    width: CellWidth - 2,
                    height: CellHeight - 2,
                    backgroundColor: getTemperatureColor(temperature),
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Popover/tooltip */}
      {hoveredEntry && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 transition-transform duration-200 ease-out",
            !expanded && "pointer-events-none",
          )}
          style={{
            left: currentPosRef.current.x,
            top: currentPosRef.current.y,
            transform: expanded
              ? "translate(-50%, 8px)"
              : "translate(-50%, calc(-100% - 6px))",
          }}
        >
          <div
            className={cn(
              "w-52 rounded-md border border-accent bg-background-2 p-3 text-xs shadow-lg duration-150 animate-in fade-in-0 zoom-in-95",
              expanded ? "origin-top" : "origin-bottom",
            )}
          >
            <p className="font-medium text-content-muted">
              {format(parseISO(hoveredEntry.date), "MMM do, yyyy")}
            </p>
            <p className="mt-0.5 text-content-subdued">
              {hoveredEntry.count}{" "}
              {hoveredEntry.count === 1 ? "license" : "licenses"} expiring
            </p>
            <div className="my-2 h-px bg-accent" />

            {!expanded && (
              <p className="text-[10px] text-content-subdued">
                + Click to show licenses
              </p>
            )}

            <div
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                {expanded && (
                  <div className="duration-200 ease-out animate-in [animation-delay:200ms] [animation-fill-mode:both] fade-in-0">
                    <HeatmapCellExpandedContent date={hoveredEntry.date} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Chart.Card>
  )
}

function HeatmapCellExpandedContent({ date }: { date: string }) {
  // TODO(cazden) Refactor with query
  const licenses = ExpiringLicensesMockData.get(date)
  const licensesLoading = false

  if (licensesLoading) {
    return (
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full rounded-xs" />
      </div>
    )
  }

  if (!licenses?.length) return null

  return (
    <>
      <ul>
        {licenses.map((license) => (
          <li key={license.id}>
            <GoToButton
              path="/$accountId/app/licenses/$id"
              params={{ accountId: keygen.config.id, id: license.id }}
              label={
                license.name || truncateKey(license.key, { maxLength: 24 })
              }
              className="[&_button]:truncate [&_button]:text-xs [&_button]:text-content-subdued [&_button]:hover:text-content-loud"
            />
          </li>
        ))}
      </ul>
      {licenses.length > 10 && (
        <p className="mt-1 text-xs text-content-disabled">
          +{licenses.length - 10} more
        </p>
      )}
    </>
  )
}
