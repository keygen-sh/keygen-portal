import {
  UserRound,
  MonitorCog,
  Fingerprint,
  CalendarRange,
  GitCommitHorizontal,
} from "lucide-react"

import { capitalize } from "@/lib/utils"

import { type SearchableResource } from "@/types/search"
import { EVENT_TYPES, type EventLogResourceFilter } from "@/types/event-logs"

import { type EventLogFilters } from "@/queries/event-logs"

import * as Filters from "@/components/filter-bar"
import { type PolymorphicResourceType } from "@/components/filter-bar/polymorphic-resource-filter"

const EVENT_TYPE_OPTIONS = EVENT_TYPES.map((event) => ({
  value: event,
  label: event,
}))

function resourceType(
  value: string,
  resource?: SearchableResource,
): PolymorphicResourceType {
  return { value, label: capitalize(value.replace(/-/g, " ")), resource }
}

const RESOURCE_TYPES: PolymorphicResourceType[] = [
  resourceType("license", "licenses"),
  resourceType("machine", "machines"),
  resourceType("user", "users"),
  resourceType("group", "groups"),
  resourceType("policy", "policies"),
  resourceType("product", "products"),
  resourceType("entitlement", "entitlements"),
  resourceType("release", "releases"),
  resourceType("package", "packages"),
  resourceType("account"),
  resourceType("artifact"),
  resourceType("component"),
  resourceType("environment"),
  resourceType("key"),
  resourceType("process"),
  resourceType("second-factor"),
  resourceType("token"),
]

const ACTOR_TYPES: PolymorphicResourceType[] = [
  resourceType("user", "users"),
  resourceType("license", "licenses"),
  resourceType("product", "products"),
  resourceType("environment"),
]

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
        types={RESOURCE_TYPES}
        value={asPolymorphic(filters.resource)}
        onChange={(resource) => onChange({ ...filters, resource })}
      />
      <Filters.PolymorphicResourceFilter
        label="Actor"
        icon={UserRound}
        types={ACTOR_TYPES}
        value={asPolymorphic(filters.whodunnit)}
        onChange={(whodunnit) => onChange({ ...filters, whodunnit })}
      />
      <Filters.StringFilter
        label="Request"
        icon={Fingerprint}
        placeholder="Request log ID..."
        value={filters.request}
        onChange={(request) => onChange({ ...filters, request })}
      />
    </Filters.FilterBar>
  )
}
