import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useSpring, useTransform, useReducedMotion } from "motion/react"
import { addDays } from "date-fns"

import { Home, KeyRound, Box, Zap, Webhook, Shield } from "lucide-react"

import { cn } from "@/lib/utils"
import { mix } from "@/lib/colors"
import {
  toDisplayRow,
  getTemperatureColor,
  buildExpirationHeatmap,
} from "@/lib/analytics"
import {
  Bar,
  walk,
  makeBars,
  advanceBars,
  sparkPath,
  heatmapCells,
  nextIndex,
} from "@/lib/hero"

import { ExpirationHeatmapEntry } from "@/types/analytics"

export const GREEN = "var(--color-brand-primary)"
export const PINK = "var(--color-brand-destructive)"
export const BLUE = "var(--color-brand-secondary)"
export const AMBER = "var(--color-brand-amber)"
export const VIOLET = mix({ color: BLUE, with: PINK, amount: 40 })

interface MetricState {
  label: string
  value: number
  spark: number[]
  color: string
}

const EVENT_DEFINITIONS = [
  {
    name: "license.checked-out",
    color: GREEN,
    badge: "text-brand-primary bg-brand-primary/15",
    data: true,
  },
  {
    name: "license.created",
    color: GREEN,
    badge: "text-brand-primary bg-brand-primary/15",
    data: true,
  },
  {
    name: "license.deleted",
    color: PINK,
    badge: "text-brand-destructive bg-brand-destructive/15",
    data: false,
  },
  {
    name: "license.expired",
    color: PINK,
    badge: "text-brand-destructive bg-brand-destructive/15",
    data: true,
  },
  {
    name: "license.renewed",
    color: BLUE,
    badge: "text-brand-secondary bg-brand-secondary/15",
    data: true,
  },
  {
    name: "license.revoked",
    color: PINK,
    badge: "text-brand-destructive bg-brand-destructive/15",
    data: false,
  },
]

function SectionHeader({ title, range }: { title: string; range: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium text-content-muted">{title}</span>
      <span className="rounded border border-brand-border-main px-2 py-0.5 text-[11px] text-content-subdued">
        {range} ▾
      </span>
    </div>
  )
}

export default function Dashboard({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  const [metrics, setMetrics] = useState<MetricState[]>(() => [
    { label: "ALUs", value: 16, spark: walk(24, 12, 4), color: GREEN },
    { label: "Users", value: 5, spark: walk(24, 6, 2), color: PINK },
    { label: "Licenses", value: 14, spark: walk(24, 12, 3), color: PINK },
    { label: "Machines", value: 8, spark: walk(24, 8, 2), color: PINK },
  ])
  const [requests, setRequests] = useState<Bar[]>(() => makeBars(60))
  const [validations, setValidations] = useState<Bar[]>(() => makeBars(60))

  const heatmap = useMemo(() => {
    const start = new Date()
    return buildExpirationHeatmap(heatmapCells(start, 365), {
      start,
      end: addDays(start, 364),
    })
  }, [])

  const cellMap = useMemo(() => {
    const m = new Map<string, ExpirationHeatmapEntry>()
    for (const e of heatmap.entries) m.set(`${e.x},${toDisplayRow(e.y)}`, e)
    return m
  }, [heatmap])

  const events = useMemo(
    () => EVENT_DEFINITIONS.map((e) => ({ ...e, spark: walk(20, 8, 3) })),
    [],
  )

  // simulate live data over time
  const lastMetric = useRef(-1)
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => {
      const idx = nextIndex(metrics.length, lastMetric.current)
      lastMetric.current = idx
      setMetrics((prev) =>
        prev.map((m, i) => {
          if (i !== idx) return m
          const step = 1 + Math.floor(Math.random() * 2)
          const delta = (Math.random() < 0.5 ? -1 : 1) * step
          const last = m.spark[m.spark.length - 1]
          const spark = [
            ...m.spark.slice(1),
            Math.max(0.5, last + (Math.random() - 0.5) * 3),
          ]
          return { ...m, value: Math.max(0, m.value + delta), spark }
        }),
      )
    }, 5000)
    return () => clearInterval(id)
  }, [reduced, metrics.length])

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => {
      if (Math.random() < 0.5) setRequests(advanceBars)
      else setValidations(advanceBars)
    }, 2000)
    return () => clearInterval(id)
  }, [reduced])

  const activity = [
    { title: "Requests", bars: requests },
    { title: "Validations", bars: validations },
  ]

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-xl border border-brand-border-main bg-background text-content-normal select-none",
        className,
      )}
    >
      <div className="flex w-12 shrink-0 flex-col items-center gap-4 border-r border-brand-border-main py-4">
        <div className="size-5 rounded bg-brand-primary/25" />
        {[Home, KeyRound, Box, Zap, Webhook, Shield].map((Icon, i) => (
          <Icon
            key={i}
            className={cn(
              "size-4",
              i === 0 ? "text-content-loud" : "text-content-disabled",
            )}
          />
        ))}
      </div>

      <div className="min-w-0 flex-1 space-y-5 p-5">
        <h3 className="font-owners-wide text-sm font-medium text-content-loud">
          Metrics
        </h3>

        <div className="grid grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-brand-border-main p-3"
            >
              <div className="text-[11px] text-content-subdued">{m.label}</div>
              <div className="mt-1 flex items-end justify-between gap-2">
                <span className="font-owners-wide text-2xl font-medium text-content-loud tabular-nums">
                  <AnimatedNumber value={m.value} />
                </span>
                <Sparkline
                  data={m.spark}
                  color={m.color}
                  className="min-w-0 flex-1"
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <SectionHeader title="Heatmaps" range="Next 1 year" />
          <div className="rounded-lg border border-brand-border-main p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-content-muted">
                License expirations
              </span>
              <span className="text-[11px] text-content-subdued">
                View all ›
              </span>
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${heatmap.numWeeks}, minmax(0, 1fr))`,
                gridTemplateRows: "repeat(7, 6px)",
                gap: 2,
              }}
            >
              {Array.from({ length: heatmap.numWeeks }, (_, wk) =>
                Array.from({ length: 7 }, (_, day) => {
                  const entry = cellMap.get(`${wk},${day}`)
                  return (
                    <div
                      key={`${wk},${day}`}
                      className="rounded-[1px]"
                      style={{
                        gridRow: day + 1,
                        gridColumn: wk + 1,
                        backgroundColor: getTemperatureColor(
                          entry?.temperature ?? 0,
                        ),
                      }}
                    />
                  )
                }),
              )}
            </div>
          </div>
        </div>

        <div>
          <SectionHeader title="Activity" range="Last 90 days" />
          <div className="grid grid-cols-2 gap-3">
            {activity.map(({ title, bars }) => (
              <div
                key={title}
                className="rounded-lg border border-brand-border-main p-4"
              >
                <div className="mb-3 text-xs font-medium text-content-muted">
                  {title}
                </div>
                <Bars
                  bars={bars}
                  tip={title === "Validations" ? VIOLET : AMBER}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Events" range="Last 30 days" />
          <div className="mb-3 flex gap-1 text-xs">
            {["Licenses", "Machines", "Processes", "Releases", "Users"].map(
              (tab, i) => (
                <span
                  key={tab}
                  className={cn(
                    "rounded-md px-2.5 py-1",
                    i === 0
                      ? "bg-background-3 text-content-loud"
                      : "text-content-subdued",
                  )}
                >
                  {tab}
                </span>
              ),
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {events.map((ev) => (
              <div
                key={ev.name}
                className="rounded-lg border border-brand-border-main p-3"
              >
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[11px]",
                    ev.badge,
                  )}
                >
                  {ev.name}
                </span>
                <div className="mt-3 flex h-16 items-center justify-center">
                  {ev.data ? (
                    <Sparkline
                      data={ev.spark}
                      color={ev.color}
                      className="w-full"
                    />
                  ) : (
                    <span className="text-[11px] text-content-disabled">
                      No analytics data for this range.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Sparkline({
  data,
  color,
  className,
}: {
  data: number[]
  color: string
  className?: string
}) {
  const d = sparkPath(data, 120, 34)
  return (
    <svg
      viewBox="0 0 120 34"
      preserveAspectRatio="none"
      className={cn("h-9 w-full", className)}
    >
      <motion.path
        initial={false}
        animate={{ d }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Bars({ bars, tip }: { bars: Bar[]; tip: string }) {
  const t = { duration: 0.6, ease: "easeOut" } as const

  return (
    <div className="flex h-36">
      {bars.map((b, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col justify-end">
          <motion.div
            className="w-[1.5px] shrink-0"
            style={{ backgroundColor: tip }}
            initial={false}
            animate={{ height: `${b.tip * 100}%` }}
            transition={t}
          />
          <motion.div
            className="w-[1.5px] shrink-0"
            style={{ backgroundColor: GREEN }}
            initial={false}
            animate={{ height: `${b.base * 100}%` }}
            transition={t}
          />
        </div>
      ))}
    </div>
  )
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 80, damping: 18 })
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString())
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  return <motion.span>{text}</motion.span>
}
