import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
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

import * as keygen from "@/keygen"

import { cn } from "@/lib/utils"
import { buildExpirationHeatmap } from "@/lib/analytics"
import { truncator } from "@/lib/truncate"

import { License } from "@/types/licenses"
import { ExpirationHeatmapEntry } from "@/types/analytics"

import {
  useExpirationsHeatmap,
  useLicensesExpiringOn,
} from "@/queries/analytics"

import { useMobile } from "@/hooks/use-mobile"
import { useCursorFollowTooltip } from "@/hooks/use-cursor-follow-tooltip"

import * as Chart from "@/components/chart"
import * as Motion from "@/components/motion"
import GoToButton from "@/components/go-to-button"
import CursorTooltip from "@/components/cursor-tooltip"

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"]
const CELL_WIDTH = 16
const CELL_HEIGHT = 8
const CELL_GAP = 2
const LABEL_WIDTH = 34

const MOBILE_CELL_GAP = 4
const MOBILE_COLUMN_COUNT = 6

const POPOVER_WIDTH = 208 // w-52

const PREVIEW_LIMIT = 5
const truncateId = truncator("clip", { maxLength: 8 })

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

export default function LicenseExpirationHeatmap({
  rangeDays = 365,
}: {
  rangeDays?: 30 | 60 | 90 | 365
}) {
  const isMobile = useMobile()
  const expirationWindow = rangeDays === 365 ? "P1Y" : `P${rangeDays}D`

  const { start, end, startParam, endParam } = useMemo(() => {
    const start = new Date()
    const end = addDays(start, rangeDays - 1)
    return {
      start,
      end,
      startParam: format(start, "yyyy-MM-dd"),
      endParam: format(end, "yyyy-MM-dd"),
    }
  }, [rangeDays])

  const { data: cells = [], isLoading } = useExpirationsHeatmap({
    start: startParam,
    end: endParam,
  })

  const { entries, numWeeks, monthLabels } = useMemo(
    () => buildExpirationHeatmap(cells, { start, end }),
    [cells, start, end],
  )

  const [expanded, setExpanded] = useState(false)

  const {
    active: hoveredEntry,
    tooltipRef,
    currentPos,
    open,
    openAt,
    move,
    close: closeTooltip,
    closeNow,
  } = useCursorFollowTooltip<ExpirationHeatmapEntry>({
    paused: expanded,
    disabled: isMobile,
  })

  // Resets all popover state back to closed
  const close = useCallback(() => {
    setExpanded(false)
    closeNow()
  }, [closeNow])

  const handleGridMouseMove = (e: React.MouseEvent) => {
    if (!expanded) move(e)
  }

  const handleCellMouseEnter = (
    entry: ExpirationHeatmapEntry,
    e: React.MouseEvent,
  ) => {
    // Close other expanded cells if any are open
    if (hoveredEntry?.date !== entry.date) {
      setExpanded(false)
    }

    open(entry, e)
  }

  // Short linger lets the cursor move between cells without dropping the tooltip
  const handleCellMouseLeave = () => {
    if (!expanded) closeTooltip()
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
    const halfW = POPOVER_WIDTH / 2

    let x = rect.left + rect.width / 2
    x = Math.max(pad + halfW, Math.min(x, window.innerWidth - pad - halfW))

    openAt(entry, { x, y: rect.bottom })
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
  }, [expanded, close, tooltipRef])

  const occupiedCells = useMemo(() => {
    const occupied = new Set<string>()
    for (const entry of entries) {
      occupied.add(`${entry.x},${toDisplayRow(entry.y)}`)
    }
    return occupied
  }, [entries])

  return (
    <Chart.Card
      title="License expirations"
      className="rounded-md md:w-full"
      action={
        <GoToButton
          path={`/$accountId/app/licenses`}
          params={{
            accountId: keygen.config.id,
          }}
          search={{
            expires: { within: expirationWindow },
          }}
          label="View all"
          className="[&_.group:hover_svg]:text-primary [&_button]:text-content-normal [&_button]:hover:text-content-loud [&_svg]:text-content-normal"
        />
      }
    >
      {isLoading ? (
        <HeatmapSkeleton />
      ) : entries.length ? (
        isMobile ? (
          <MobileHeatmapGrid
            entries={entries}
            windowStart={start}
            windowEnd={end}
            hoveredEntry={hoveredEntry}
            onCellTap={handleCellTap}
            close={close}
          />
        ) : (
          <div className="relative w-full overflow-x-auto">
            <div
              style={{
                width: "100%",
                minWidth: LABEL_WIDTH + numWeeks * (CELL_WIDTH + CELL_GAP),
              }}
            >
              <div
                onMouseMove={handleGridMouseMove}
                style={{
                  display: "grid",
                  gridTemplateColumns: `${LABEL_WIDTH}px repeat(${numWeeks}, minmax(${CELL_WIDTH}px, 1fr))`,
                  gridTemplateRows: `auto repeat(7, ${CELL_HEIGHT}px)`,
                  columnGap: CELL_GAP,
                  rowGap: CELL_GAP,
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

                {DAY_LABELS.map((label, index) => (
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
                          height: CELL_HEIGHT,
                          width: "100%",
                        }}
                      />
                    )
                  }),
                )}

                {entries.map((entry) => (
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
                      height: CELL_HEIGHT,
                      width: "100%",
                    }}
                  />
                ))}
              </div>

              {/* Temperature legend */}
              <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-content-subdued">
                <span>Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((temperature) => (
                  <div
                    key={temperature}
                    style={{
                      width: CELL_WIDTH - 2,
                      height: CELL_HEIGHT - 2,
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
      <CursorTooltip
        open={!!hoveredEntry}
        tooltipRef={tooltipRef}
        currentPos={currentPos}
        offset={8}
        interactive={expanded}
        className={cn(
          "max-w-[calc(100vw-2rem)] min-w-52 origin-top",
          !expanded && !isMobile ? "w-52" : "w-fit",
        )}
      >
        {hoveredEntry && (
          <>
            <p className="font-medium text-content-muted">
              {format(parseISO(hoveredEntry.date), "MMM do, yyyy")}
            </p>
            <p className="mt-0.5 text-content-subdued">
              {hoveredEntry.count}{" "}
              {hoveredEntry.count === 1 ? "license" : "licenses"} expiring
            </p>
            <div className="my-2 h-px bg-accent" />

            {!isMobile && !expanded && (
              <div className="group flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm">
                <span className="min-w-0 flex-1 truncate text-content-muted">
                  Click to load licenses…
                </span>
              </div>
            )}

            {isMobile ? (
              <HeatmapLicenseList
                date={hoveredEntry.date}
                count={hoveredEntry.count}
              />
            ) : (
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  {expanded && (
                    <div className="duration-200 ease-out animate-in [animation-delay:200ms] [animation-fill-mode:both] fade-in-0">
                      <HeatmapLicenseList
                        date={hoveredEntry.date}
                        count={hoveredEntry.count}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CursorTooltip>
    </Chart.Card>
  )
}

function HeatmapSkeleton() {
  return (
    <div className="w-full overflow-hidden">
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="grid grid-cols-[34px_repeat(53,minmax(16px,1fr))] grid-rows-[auto_repeat(7,8px)] gap-0.5">
        {Array.from({ length: 8 * 54 }).map((_, index) => {
          const isLabelColumn = index % 54 === 0
          const isMonthRow = index < 54

          return (
            <Skeleton
              key={index}
              className={cn(
                "rounded-none",
                isLabelColumn || isMonthRow
                  ? "h-3 bg-transparent"
                  : "h-2 w-full",
              )}
            />
          )
        })}
      </div>
      <div className="mt-3 flex justify-end gap-1.5">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-2 w-5 rounded-none" />
        ))}
      </div>
    </div>
  )
}

function MobileHeatmapGrid({
  entries,
  windowStart,
  windowEnd,
  hoveredEntry,
  onCellTap,
  close,
}: {
  entries: ExpirationHeatmapEntry[]
  windowStart: Date
  windowEnd: Date
  hoveredEntry: ExpirationHeatmapEntry | null
  onCellTap: (entry: ExpirationHeatmapEntry, e: React.MouseEvent) => void
  close: () => void
}) {
  const minMonth = useMemo(() => startOfMonth(windowStart), [windowStart])
  const maxMonth = useMemo(() => startOfMonth(windowEnd), [windowEnd])

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
    for (const entry of entries) {
      const d = parseISO(entry.date)
      if (isSameMonth(d, currentMonth)) {
        map.set(entry.date, entry)
      }
    }
    return map
  }, [entries, currentMonth])

  const gridCells = useMemo(() => {
    const firstDayRow = toMondayRow(getDay(startOfMonth(currentMonth)))
    const daysInMonth = getDaysInMonth(currentMonth)
    const totalSlots = MOBILE_COLUMN_COUNT * 7
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
              gridTemplateColumns: `${LABEL_WIDTH}px repeat(${MOBILE_COLUMN_COUNT}, 1fr)`,
              gridTemplateRows: `repeat(7, 18px)`,
              columnGap: MOBILE_CELL_GAP,
              rowGap: MOBILE_CELL_GAP,
            }}
          >
            {/* Day labels */}
            {DAY_LABELS.map((label, index) => (
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

function HeatmapLicenseList({ date, count }: { date: string; count: number }) {
  const navigate = useNavigate()
  const { data: licenses = [], isLoading } = useLicensesExpiringOn(date, {
    limit: PREVIEW_LIMIT,
  })

  const openLicense = (license: License) => {
    void navigate({
      to: "/$accountId/app/licenses/$id",
      params: { accountId: keygen.config.id, id: license.id },
    })
  }

  const openExpiringLicenses = () => {
    void navigate({
      to: "/$accountId/app/licenses",
      params: { accountId: keygen.config.id },
      search: { expires: { on: date } },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-1.5 py-1">
        {Array.from(
          { length: Math.max(1, Math.min(count, PREVIEW_LIMIT)) },
          (_, index) => (
            <Skeleton key={index} className="h-6 w-full rounded-xs" />
          ),
        )}
      </div>
    )
  }

  if (!licenses.length) return null

  const additionalLicenseCount = count - licenses.length

  return (
    <div className="w-64 max-w-[calc(100vw-3.5rem)] space-y-0.5">
      {licenses.map((license: License) => (
        <button
          key={license.id}
          type="button"
          onClick={() => openLicense(license)}
          className="group flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
        >
          <span className="min-w-0 flex-1 truncate text-content-loud group-hover:text-accent-foreground group-focus-visible:text-accent-foreground">
            {license.attributes.name || (
              <span className="text-content-disabled">{"(name not set)"}</span>
            )}
          </span>
          <span className="ml-auto shrink-0 truncate font-mono text-xs text-muted-foreground group-hover:text-accent-foreground/70 group-focus-visible:text-accent-foreground/70">
            {truncateId(license.id)}
          </span>
        </button>
      ))}
      {additionalLicenseCount > 0 && (
        <button
          type="button"
          onClick={openExpiringLicenses}
          className="group flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
        >
          <span className="min-w-0 flex-1 truncate text-content-muted group-hover:text-accent-foreground group-focus-visible:text-accent-foreground">
            +{additionalLicenseCount} more{" "}
            {additionalLicenseCount === 1 ? "license" : "licenses"}
          </span>
          <span className="ml-auto shrink-0 text-xs text-primary">
            View all
            <ChevronRight className="ml-1 inline size-3 align-[-2px] text-primary transition-all duration-200 group-hover:translate-x-0.5" />
          </span>
        </button>
      )}
    </div>
  )
}
