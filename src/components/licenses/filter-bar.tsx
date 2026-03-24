import {
  CircleDot,
  Clock,
  CircleOff,
  Activity,
  Power,
  Hash,
  Link,
  Unlink,
  Package,
  Shield,
  Crown,
  User,
  Users,
} from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { useListPolicies } from "@/queries/policies"
import { useListUsers } from "@/queries/users"
import { useListGroups } from "@/queries/groups"
import { LicenseStatus, LicenseStatusLabels } from "@/types/licenses"
import { type LicenseFilters } from "@/queries/licenses"

const STATUS_OPTIONS = Object.values(LicenseStatus).map((status) => ({
  value: status,
  label: LicenseStatusLabels[status],
}))

const TEMPORAL_FILTER_OPS = [
  { value: "in", label: "Within", type: "duration" },
  { value: "on", label: "On", type: "date" },
  { value: "before", label: "Before", type: "date" },
  { value: "after", label: "After", type: "date" },
] as const

const ACTIVITY_FILTER_OPS = [
  { value: "inside", label: "Inside", type: "duration" },
  { value: "outside", label: "Outside", type: "duration" },
  { value: "before", label: "Before", type: "date" },
  { value: "after", label: "After", type: "date" },
] as const

const DURATION_PRESETS = [
  { label: "3 days", iso: "P3D" },
  { label: "7 days", iso: "P7D" },
  { label: "30 days", iso: "P30D" },
  { label: "60 days", iso: "P60D" },
  { label: "90 days", iso: "P90D" },
  { label: "1 year", iso: "P1Y" },
] as const

const ACTIVATIONS_OPS = [
  { value: "eq", label: "Equal to" },
  { value: "gt", label: "Greater than" },
  { value: "gte", label: "At least" },
  { value: "lt", label: "Less than" },
  { value: "lte", label: "At most" },
] as const

interface LicenseFilterBarProps {
  filters: LicenseFilters
  onChange: (filters: LicenseFilters) => void
}

export default function LicenseFilterBar({
  filters,
  onChange,
}: LicenseFilterBarProps) {
  const filterCount = Object.values(filters).filter((v) => v != null).length

  // NB(ezekg) lazy queries that only pop off on first resource filter activation
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const enable = useCallback((key: string) => {
    setEnabled((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }, [])

  const { data: products = [] } = useListProducts(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.products },
  )
  const { data: policies = [] } = useListPolicies(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.policies },
  )
  const { data: users = [] } = useListUsers(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.users },
  )
  const { data: groups = [] } = useListGroups(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.groups },
  )

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({})}
      pinned={
        <Filters.EnumFilter
          label="Status"
          icon={CircleDot}
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(status) =>
            onChange({ ...filters, status: status ?? undefined })
          }
        />
      }
    >
      <Filters.TemporalFilter
        label="Expires"
        icon={Clock}
        ops={TEMPORAL_FILTER_OPS}
        durations={DURATION_PRESETS}
        value={filters.expires}
        onChange={(expires) => onChange({ ...filters, expires })}
      />
      <Filters.TemporalFilter
        label="Expired"
        icon={CircleOff}
        ops={TEMPORAL_FILTER_OPS}
        durations={DURATION_PRESETS}
        value={filters.expired}
        onChange={(expired) => onChange({ ...filters, expired })}
      />
      <Filters.TemporalFilter
        label="Activity"
        icon={Activity}
        ops={ACTIVITY_FILTER_OPS}
        durations={DURATION_PRESETS}
        value={filters.activity}
        onChange={(activity) => onChange({ ...filters, activity })}
      />
      <Filters.BooleanFilter
        label="Activated"
        icon={Power}
        value={filters.activated}
        onChange={(v) => onChange({ ...filters, activated: v })}
      />
      <Filters.NumericFilter
        label="Activations"
        icon={Hash}
        ops={ACTIVATIONS_OPS}
        defaultOp="gte"
        defaultCount={1}
        value={filters.activations}
        onChange={(activations) => onChange({ ...filters, activations })}
      />
      <Filters.BooleanFilter
        label="Assigned"
        icon={Link}
        value={filters.assigned}
        onChange={(v) => onChange({ ...filters, assigned: v })}
      />
      <Filters.BooleanFilter
        label="Unassigned"
        icon={Unlink}
        value={filters.unassigned}
        onChange={(v) => onChange({ ...filters, unassigned: v })}
      />
      <Filters.ResourceFilter
        label="Product"
        icon={Package}
        resource="products"
        options={products}
        onActivate={() => enable("products")}
        value={filters.product}
        onChange={(v) => onChange({ ...filters, product: v })}
      />
      <Filters.ResourceFilter
        label="Policy"
        icon={Shield}
        resource="policies"
        options={policies}
        onActivate={() => enable("policies")}
        value={filters.policy}
        onChange={(v) => onChange({ ...filters, policy: v })}
      />
      <Filters.ResourceFilter
        label="Owner"
        icon={Crown}
        resource="users"
        options={users}
        onActivate={() => enable("users")}
        clearLabel="Any owner"
        value={filters.owner}
        onChange={(v) => onChange({ ...filters, owner: v })}
      />
      <Filters.ResourceFilter
        label="User"
        icon={User}
        resource="users"
        options={users}
        onActivate={() => enable("users")}
        clearLabel="Any user"
        value={filters.user}
        onChange={(v) => onChange({ ...filters, user: v })}
      />
      <Filters.ResourceFilter
        label="Group"
        icon={Users}
        resource="groups"
        options={groups}
        onActivate={() => enable("groups")}
        clearLabel="Any group"
        value={filters.group}
        onChange={(v) => onChange({ ...filters, group: v })}
      />
      <Filters.MetadataFilter
        value={filters.metadata}
        onChange={(metadata) => onChange({ ...filters, metadata })}
      />
    </Filters.FilterBar>
  )
}
