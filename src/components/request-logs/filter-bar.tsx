import {
  Hash,
  Globe,
  Link2,
  UserRound,
  MonitorCog,
  CalendarRange,
  ArrowLeftRight,
} from "lucide-react"

import { capitalize } from "@/lib/utils"

import { type SearchableResource } from "@/types/search"
import {
  HTTP_METHODS,
  HTTP_STATUS_CODES,
  type RequestLogResourceFilter,
} from "@/types/request-logs"

import { type RequestLogFilters } from "@/queries/request-logs"

import { useEdition } from "@/hooks/use-edition"

import * as Filters from "@/components/filter-bar"
import { type PolymorphicResourceType } from "@/components/filter-bar/polymorphic-resource-filter"

const METHOD_OPTIONS = HTTP_METHODS.map((method) => ({
  value: method,
  label: method,
}))

const STATUS_OPTIONS = HTTP_STATUS_CODES.map(({ code, text }) => ({
  value: code,
  label: `${code} ${text}`,
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

const REQUESTOR_TYPES: PolymorphicResourceType[] = [
  resourceType("user", "users"),
  resourceType("license", "licenses"),
  resourceType("product", "products"),
  resourceType("environment"),
]

interface RequestLogFilterBarProps {
  filters: RequestLogFilters
  onChange: (filters: RequestLogFilters) => void
}

function asPolymorphic(
  value: RequestLogResourceFilter | undefined,
): { type: string; id: string } | undefined {
  return value && typeof value === "object" ? value : undefined
}

export default function RequestLogFilterBar({
  filters,
  onChange,
}: RequestLogFilterBarProps) {
  const { isCE } = useEdition()

  const filterCount = Object.entries(filters).filter(([key, value]) => {
    if (value == null) return false
    if (key === "date") return !!(filters.date?.start && filters.date?.end)
    return true
  }).length

  return (
    <Filters.FilterBar
      disabled={isCE}
      filterCount={filterCount}
      onClearAll={() => onChange({})}
      pinned={
        <Filters.DateRangeFilter
          label="Date"
          icon={CalendarRange}
          value={filters.date}
          onChange={(date) => onChange({ ...filters, date })}
        />
      }
    >
      <Filters.EnumFilter
        label="Method"
        icon={ArrowLeftRight}
        options={METHOD_OPTIONS}
        value={filters.method}
        onChange={(method) => onChange({ ...filters, method })}
      />
      <Filters.EnumFilter
        label="Status"
        icon={Hash}
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
        popoverClassName="w-60"
        renderOption={(option) => (
          <span className="flex min-w-0 items-baseline gap-1.5">
            <span className="shrink-0 font-mono">{option.value}</span>
            <span className="min-w-0 truncate text-content-normal">
              {option.label.slice(option.value.length + 1)}
            </span>
          </span>
        )}
      />
      <Filters.StringFilter
        label="IP"
        icon={Globe}
        placeholder="e.g. 1.1.1.1"
        value={filters.ip}
        onChange={(ip) => onChange({ ...filters, ip })}
      />
      <Filters.StringFilter
        label="URL"
        icon={Link2}
        placeholder="e.g. /v1/..."
        value={filters.url}
        onChange={(url) => onChange({ ...filters, url })}
      />
      <Filters.PolymorphicResourceFilter
        label="Resource"
        icon={MonitorCog}
        types={RESOURCE_TYPES}
        value={asPolymorphic(filters.resource)}
        onChange={(resource) => onChange({ ...filters, resource })}
      />
      <Filters.PolymorphicResourceFilter
        label="Requestor"
        icon={UserRound}
        types={REQUESTOR_TYPES}
        value={asPolymorphic(filters.requestor)}
        onChange={(requestor) => onChange({ ...filters, requestor })}
      />
    </Filters.FilterBar>
  )
}
