import {
  CalendarRange,
  Fingerprint,
  GitCommitHorizontal,
  MonitorCog,
  UserRound,
} from "lucide-react"

import * as Filters from "@/components/filter-bar"

import { type EventLogFilters } from "@/queries/event-logs"

const DATE_OPTIONS = [{ label: "On", op: "on" }] as const

interface EventLogFilterBarProps {
  filters: EventLogFilters
  onChange: (filters: EventLogFilters) => void
}

function updateDateFilter(
  filters: EventLogFilters,
  key: "start" | "end",
  value?: Record<string, string>,
): EventLogFilters {
  const date = {
    ...filters.date,
    [key]: value?.on,
  }

  if (!date.start && !date.end) {
    return { ...filters, date: undefined }
  }

  return { ...filters, date }
}

function asStringFilter(
  value: EventLogFilters["resource"],
): string | undefined {
  return typeof value === "string" ? value : undefined
}

export default function EventLogFilterBar({
  filters,
  onChange,
}: EventLogFilterBarProps) {
  const filterCount = Object.entries(filters).filter(([key, value]) => {
    if (value == null) return false
    if (key === "date") return !!(filters.date?.start && filters.date?.end)
    return true
  }).length

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({})}
      pinned={
        <Filters.StringFilter
          label="Event"
          icon={GitCommitHorizontal}
          placeholder="e.g. license.updated"
          value={filters.event}
          onChange={(event) => onChange({ ...filters, event })}
        />
      }
    >
      <Filters.DateFilter
        label="Start"
        icon={CalendarRange}
        options={DATE_OPTIONS}
        value={filters.date?.start ? { on: filters.date.start } : undefined}
        onChange={(value) =>
          onChange(updateDateFilter(filters, "start", value))
        }
      />
      <Filters.DateFilter
        label="End"
        icon={CalendarRange}
        options={DATE_OPTIONS}
        value={filters.date?.end ? { on: filters.date.end } : undefined}
        onChange={(value) => onChange(updateDateFilter(filters, "end", value))}
      />
      <Filters.StringFilter
        label="Resource"
        icon={MonitorCog}
        placeholder="Resource ID"
        value={asStringFilter(filters.resource)}
        onChange={(resource) => onChange({ ...filters, resource })}
      />
      <Filters.StringFilter
        label="Actor"
        icon={UserRound}
        placeholder="Actor ID"
        value={asStringFilter(filters.whodunnit)}
        onChange={(whodunnit) => onChange({ ...filters, whodunnit })}
      />
      <Filters.StringFilter
        label="Request"
        icon={Fingerprint}
        placeholder="Request log ID"
        value={filters.request}
        onChange={(request) => onChange({ ...filters, request })}
      />
    </Filters.FilterBar>
  )
}
