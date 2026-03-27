import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  format,
  getDay,
  addDays,
  subDays,
  parseISO,
  subMonths,
  addMonths,
  isSameMonth,
  startOfMonth,
  getDaysInMonth,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
  ExpirationHeatmapEntry,
  ExpiringLicensesMockData,
  ExpirationHeatmapMockData,
} from "@/mock/metrics"

import * as keygen from "@/keygen"

import { cn } from "@/lib/utils"
import { truncateKey } from "@/lib/licenses"

import { useMobile } from "@/hooks/use-mobile"

import * as Chart from "@/components/chart"
import * as Motion from "@/components/motion"
import GoToButton from "@/components/go-to-button"

const DayLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"]
const CellWidth = 16
const CellHeight = 8
const CellGap = 2
const LabelWidth = 34

const MobileCellGap = 4
const MobileColumnCount = 6

const PopoverWidth = 208 // w-52

function toDisplayRow(y: number): number {
  return (y + 6) % 7
}

function toMondayRow(isoDay: number): number {
  return isoDay === 0 ? 6 : isoDay - 1
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
  const isMobile = useMobile()

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

  // On mobile, tap a cell to select it and show popover
  const handleCellTap = (
    entry: ExpirationHeatmapEntry,
    e: React.MouseEvent,
  ) => {
    if (expanded && hoveredEntry?.date === entry.date) {
      close()
      return
    }

    // Position popover within screen bounds below selected cell
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const pad = 8
    const halfW = PopoverWidth / 2

    let x = rect.left + rect.width / 2
    x = Math.max(pad + halfW, Math.min(x, window.innerWidth - pad - halfW))

    const pos = { x, y: rect.bottom }
    targetPosRef.current = pos
    currentPosRef.current = { ...pos }

    setHoveredEntry(entry)
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
    if (isMobile || !hoveredEntry || expanded) {
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
  }, [hoveredEntry, expanded, isMobile])

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
        isMobile ? (
          <MobileHeatmapGrid
            hoveredEntry={hoveredEntry}
            onCellTap={handleCellTap}
            close={close}
          />
        ) : (
          <div className="relative w-full overflow-x-auto">
            <div
              style={{
                minWidth: LabelWidth + numWeeks * (CellWidth + CellGap),
              }}
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
                    if (occupiedCells.has(`${weekIndex},${dayIndex}`))
                      return null
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
        )
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
            transform: "translate(-50%, 8px)",
          }}
        >
          <div
            className={cn(
              "w-52 origin-top rounded-md border border-accent bg-background-2 p-3 text-xs shadow-lg duration-150 animate-in fade-in-0 zoom-in-95",
            )}
            style={{
              width: PopoverWidth,
            }}
          >
            <p className="font-medium text-content-muted">
              {format(parseISO(hoveredEntry.date), "MMM do, yyyy")}
            </p>
            <p className="mt-0.5 text-content-subdued">
              {hoveredEntry.count}{" "}
              {hoveredEntry.count === 1 ? "license" : "licenses"} expiring
            </p>
            <div className="my-2 h-px bg-accent" />

            {!isMobile && !expanded && (
              <p className="text-[10px] text-content-subdued">
                + Click to show licenses
              </p>
            )}

            {isMobile ? (
              <HeatmapCellExpandedContent date={hoveredEntry.date} />
            ) : (
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
            )}
          </div>
        </div>
      )}
    </Chart.Card>
  )
}

function MobileHeatmapGrid({
  hoveredEntry,
  onCellTap,
  close,
}: {
  hoveredEntry: ExpirationHeatmapEntry | null
  onCellTap: (entry: ExpirationHeatmapEntry, e: React.MouseEvent) => void
  close: () => void
}) {
  // Derive the date range from the data to bound navigation
  const { minMonth, maxMonth } = useMemo((): {
    minMonth: Date
    maxMonth: Date
  } => {
    if (!ExpirationHeatmapMockData?.length)
      return { minMonth: new Date(), maxMonth: new Date() }
    const dates = ExpirationHeatmapMockData.map((e) => parseISO(e.date))
    return {
      minMonth: startOfMonth(dates.reduce((a, b) => (a < b ? a : b))),
      maxMonth: startOfMonth(dates.reduce((a, b) => (a > b ? a : b))),
    }
  }, [])

  const [currentMonth, setCurrentMonth] = useState(() => minMonth)
  const [direction, setDirection] = useState<1 | -1>(1)

  const canGoPrev = currentMonth > minMonth
  const canGoNext = currentMonth < maxMonth

  const goPrev = () => {
    if (canGoPrev) {
      close()
      setDirection(-1)
      setCurrentMonth((m: Date) => subMonths(m, 1))
    }
  }
  const goNext = () => {
    if (canGoNext) {
      close()
      setDirection(1)
      setCurrentMonth((m: Date) => addMonths(m, 1))
    }
  }

  // Build lookup of date/entry for current month
  const entryByDate = useMemo(() => {
    const map = new Map<string, ExpirationHeatmapEntry>()
    for (const entry of ExpirationHeatmapMockData) {
      const d = parseISO(entry.date)
      if (isSameMonth(d, currentMonth)) {
        map.set(entry.date, entry)
      }
    }
    return map
  }, [currentMonth])

  const gridCells = useMemo(() => {
    const firstDayRow = toMondayRow(getDay(startOfMonth(currentMonth)))
    const daysInMonth = getDaysInMonth(currentMonth)
    const totalSlots = MobileColumnCount * 7
    const trailingPad = totalSlots - (firstDayRow + daysInMonth)

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const cells: {
      row: number
      col: number
      dateStr: string
      entry: ExpirationHeatmapEntry | null
      isPadding: boolean
    }[] = []

    // Leading padding from previous month
    const monthStart = startOfMonth(currentMonth)
    for (let i = firstDayRow - 1; i >= 0; i--) {
      const d = subDays(monthStart, i + 1)
      const idx = firstDayRow - i - 1
      cells.push({
        row: idx % 7,
        col: Math.floor(idx / 7),
        dateStr: format(d, "yyyy-MM-dd"),
        entry: null,
        isPadding: true,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const idx = firstDayRow + (day - 1)
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      cells.push({
        row: idx % 7,
        col: Math.floor(idx / 7),
        dateStr,
        entry: entryByDate.get(dateStr) ?? null,
        isPadding: false,
      })
    }

    // Trailing padding from next month
    const lastDay = new Date(year, month, daysInMonth)
    for (let i = 0; i < trailingPad; i++) {
      const d = addDays(lastDay, i + 1)
      const idx = firstDayRow + daysInMonth + i
      cells.push({
        row: idx % 7,
        col: Math.floor(idx / 7),
        dateStr: format(d, "yyyy-MM-dd"),
        entry: null,
        isPadding: true,
      })
    }

    return cells
  }, [currentMonth, entryByDate])

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium text-content-muted">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={!canGoNext}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Motion.Slide direction={direction} offset={40} duration={0.2}>
        <div key={currentMonth.toISOString()}>
          {/* Heatmap grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${LabelWidth}px repeat(${MobileColumnCount}, 1fr)`,
              gridTemplateRows: `repeat(7, 18px)`,
              columnGap: MobileCellGap,
              rowGap: MobileCellGap,
            }}
          >
            {/* Day labels */}
            {DayLabels.map((label, index) => (
              <div
                key={index}
                className="flex items-center text-[10px] leading-none text-content-subdued"
                style={{ gridRow: index + 1, gridColumn: 1 }}
              >
                {label}
                {label && (
                  <span className="mr-1 ml-auto h-px w-1 bg-content-disabled" />
                )}
              </div>
            ))}

            {/* Day cells */}
            {gridCells.map(({ row, col, dateStr, entry, isPadding }) => {
              const temperature = entry?.temperature ?? 0
              const hasExpirations =
                !isPadding && entry != null && entry.count > 0

              if (isPadding) {
                return (
                  <div
                    key={dateStr}
                    className="rounded-xs opacity-20"
                    style={{
                      gridRow: row + 1,
                      gridColumn: col + 2,
                      backgroundColor: getTemperatureColor(0),
                    }}
                  />
                )
              }

              return hasExpirations ? (
                <div
                  key={dateStr}
                  onClick={(e) => onCellTap(entry, e)}
                  className={cn(
                    "cursor-pointer rounded-xs transition-transform duration-150 ease-out",
                    hoveredEntry?.date === dateStr && "z-10 scale-[1.3]",
                  )}
                  style={{
                    gridRow: row + 1,
                    gridColumn: col + 2,
                    backgroundColor: getTemperatureColor(temperature),
                  }}
                />
              ) : (
                <div
                  key={dateStr}
                  className="rounded-xs"
                  style={{
                    gridRow: row + 1,
                    gridColumn: col + 2,
                    backgroundColor: getTemperatureColor(0),
                  }}
                />
              )
            })}
          </div>
        </div>
      </Motion.Slide>

      {/* Temperature legend */}
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-content-subdued">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((temperature) => (
          <div
            key={temperature}
            style={{
              width: 14,
              height: 10,
              backgroundColor: getTemperatureColor(temperature),
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
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
