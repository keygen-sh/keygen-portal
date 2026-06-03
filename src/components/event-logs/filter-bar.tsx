import {
  CalendarRange,
  Fingerprint,
  GitCommitHorizontal,
  MonitorCog,
  UserRound,
} from "lucide-react"

import * as Filters from "@/components/filter-bar"

import { EVENT_TYPES, type EventLogResourceFilter } from "@/types/event-logs"
import { type EventLogFilters } from "@/queries/event-logs"

const EVENT_TYPE_OPTIONS = EVENT_TYPES.map((event) => ({
  value: event,
  label: event,
}))

const toOptions = (types: readonly string[]) =>
  types.map((type) => ({ value: type, label: type }))

const RESOURCE_TYPES = toOptions([
  "account",
  "artifact",
  "component",
  "entitlement",
  "environment",
  "group",
  "key",
  "license",
  "machine",
  "package",
  "policy",
  "process",
  "product",
  "release",
  "second-factor",
  "token",
  "user",
])

// whodunnit is the token bearer
const ACTOR_TYPES = toOptions(["user", "product", "license", "environment"])

interface EventLogFilterBarProps {
  filters: EventLogFilters
  onChange: (filters: EventLogFilters) => void
}

function asPolymorphic(
  value: EventLogResourceFilter | undefined,
): { type: string; id: string } | undefined {
  return value && typeof value === "object" ? value : undefined
}

export default function EventLogFilterBar({
  filters,
  onChange,
}: EventLogFilterBarProps) {
  const filterCount = Object.entries(filters).filter(([key, value]) => {
    if (value == null) return false
    if (key === "date") return !!(filters.date?.start && filters.date?.end)
    if (key === "events") return (filters.events?.length ?? 0) > 0
    return true
  }).length

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({})}
      pinned={
        <Filters.SearchSelectFilter
          label="Event"
          icon={GitCommitHorizontal}
          placeholder="Search event types..."
          options={EVENT_TYPE_OPTIONS}
          value={filters.events}
          onChange={(events) => onChange({ ...filters, events })}
        />
      }
    >
      <Filters.DateRangeFilter
        label="Date"
        icon={CalendarRange}
        value={filters.date}
        onChange={(date) => onChange({ ...filters, date })}
      />
      <Filters.PolymorphicResourceFilter
        label="Resource"
        icon={MonitorCog}
        placeholder="Resource ID"
        types={RESOURCE_TYPES}
        value={asPolymorphic(filters.resource)}
        onChange={(resource) => onChange({ ...filters, resource })}
      />
      <Filters.PolymorphicResourceFilter
        label="Actor"
        icon={UserRound}
        placeholder="Actor ID"
        types={ACTOR_TYPES}
        value={asPolymorphic(filters.whodunnit)}
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
