import { addDays, format } from "date-fns"

import { ExpirationHeatmapEntry } from "@/types/analytics"

export type HeroVariant = "login" | "register" | "recovery"

export function heroVariantFromRouteId(routeId: string): HeroVariant {
  if (routeId.includes("/register")) return "register"
  if (routeId.includes("/recovery") || routeId.includes("/reset"))
    return "recovery"
  return "login"
}

export type Bar = { base: number; tip: number }

// create a random walk of n values starting at start and varying by vol
export function walk(n: number, start: number, vol: number): number[] {
  const arr = [start]
  for (let i = 1; i < n; i++)
    arr.push(Math.max(0.5, arr[i - 1] + (Math.random() - 0.5) * vol))
  return arr
}

// split a bar into a base and tip
function splitBar(total: number): Bar {
  const tip = total * (0.08 + Math.random() * 0.14)
  return { base: total - tip, tip }
}

// create a random set of bars
export function makeBars(n: number): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    if (i === n - 1) return splitBar(0.05 + Math.random() * 0.06)
    const trend = 0.35 + (i / n) * 0.45
    return splitBar(Math.min(0.85, trend * (0.75 + Math.random() * 0.45)))
  })
}

// advance the bars by one tick after rolling the last bar to a new random height if it tops out
export function advanceBars(bars: Bar[]): Bar[] {
  const next = [...bars]
  const i = next.length - 1
  const total = next[i].base + next[i].tip

  // cap each bar at a random height and roll to a new "date" so there's variance
  if (total >= 0.9 || (total >= 0.3 && Math.random() < 0.25)) {
    next.shift()
    next.push(splitBar(0.04 + Math.random() * 0.05))
    return next
  }
  next[i] = splitBar(Math.min(1, total + 0.06 + Math.random() * 0.09))
  return next
}

// get the next index in a list of items, randomizing if the previous index is invalid
export function nextIndex(count: number, prev: number): number {
  if (count <= 1) return 0
  if (prev < 0 || prev >= count) return Math.floor(Math.random() * count)
  return (prev + 1 + Math.floor(Math.random() * (count - 1))) % count
}

// create a sparkline path, scaling to the given width and height
export function sparkPath(data: number[], w: number, h: number): string {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  return data
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`,
    )
    .join(" ")
}

// create a random set of heatmap cells for the given number of days from start
export function heatmapCells(
  start: Date,
  days: number,
): ExpirationHeatmapEntry[] {
  let seed = 0x1a2b3c4d
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
  const cells: ExpirationHeatmapEntry[] = []
  for (let i = 0; i < days; i++) {
    const r = rnd()
    let count = 0
    if (r > 0.75) count = 1 + Math.floor(rnd() * 3)
    if (r > 0.925) count = 5 + Math.floor(rnd() * 8)
    cells.push({
      date: format(addDays(start, i), "yyyy-MM-dd"),
      count,
      x: 0,
      y: 0,
      temperature: 0,
    })
  }
  return cells
}
