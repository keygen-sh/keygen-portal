import {
  CircleDot,
  Clock,
  Activity,
  Shield,
  User,
  Users,
  ClockAlert,
  UserCheck,
  UserX,
  Workflow,
  Box,
  SquareStack,
  Network,
  Braces,
} from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { useListPolicies } from "@/queries/policies"
import { useListUsers } from "@/queries/users"
import { useListGroups } from "@/queries/groups"
import { LicenseStatus, LicenseStatusLabels } from "@/types/licenses"
import { type LicenseFilters } from "@/queries/licenses"

const DURATION_PRESETS = [
  { label: "3 days", value: "P3D" },
  { label: "7 days", value: "P7D" },
  { label: "30 days", value: "P30D" },
  { label: "60 days", value: "P60D" },
  { label: "90 days", value: "P90D" },
  { label: "1 year", value: "P1Y" },
] as const

const STATUS_OPTIONS = Object.values(LicenseStatus).map((status) => ({
  label: LicenseStatusLabels[status],
  value: status,
}))

const EXPIRES_OPTIONS = [
  {
    type: "duration",
    label: "Within",
    op: "within",
    options: DURATION_PRESETS,
  },
  { type: "date", label: "On", op: "on" },
  { type: "date", label: "Before", op: "before" },
  { type: "date", label: "After", op: "after" },
] as const

const EXPIRED_OPTIONS = [
  {
    type: "duration",
    label: "Within",
    op: "within",
    options: DURATION_PRESETS,
  },
  { type: "date", label: "On", op: "on" },
  { type: "date", label: "Before", op: "before" },
  { type: "date", label: "After", op: "after" },
] as const

const ACTIVITY_OPTIONS = [
  {
    type: "duration",
    label: "Inside",
    op: "inside",
    options: DURATION_PRESETS,
  },
  {
    type: "duration",
    label: "Outside",
    op: "outside",
    options: DURATION_PRESETS,
  },
  { type: "date", label: "Before", op: "before" },
  { type: "date", label: "After", op: "after" },
] as const

const ACTIVATIONS_OPTIONS = [
  { label: "Equal to", op: "eq" },
  { label: "Greater than", op: "gt" },
  { label: "At least", op: "gte" },
  { label: "Less than", op: "lt" },
  { label: "At most", op: "lte" },
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
          onChange={(status) => onChange({ ...filters, status })}
        />
      }
    >
      <Filters.TemporalFilter
        label="Expires"
        icon={Clock}
        options={EXPIRES_OPTIONS}
        value={filters.expires}
        onChange={(expires) => onChange({ ...filters, expires })}
      />
      <Filters.TemporalFilter
        label="Expired"
        icon={ClockAlert}
        options={EXPIRED_OPTIONS}
        value={filters.expired}
        onChange={(expired) => onChange({ ...filters, expired })}
      />
      <Filters.TemporalFilter
        label="Activity"
        icon={Activity}
        options={ACTIVITY_OPTIONS}
        value={filters.activity}
        onChange={(activity) => onChange({ ...filters, activity })}
      />
      <Filters.BooleanFilter
        label="Activated"
        icon={Workflow}
        value={filters.activated}
        onChange={(activated) => onChange({ ...filters, activated })}
      />
      <Filters.NumericFilter
        label="Activations"
        icon={Network}
        options={ACTIVATIONS_OPTIONS}
        value={filters.activations}
        onChange={(activations) => onChange({ ...filters, activations })}
      />
      <Filters.BooleanFilter
        label="Assigned"
        icon={UserCheck}
        value={filters.assigned}
        onChange={(assigned) => onChange({ ...filters, assigned })}
      />
      <Filters.BooleanFilter
        label="Unassigned"
        icon={UserX}
        value={filters.unassigned}
        onChange={(unassigned) => onChange({ ...filters, unassigned })}
      />
      <Filters.ResourceFilter
        label="Product"
        icon={Box}
        resource="products"
        options={products}
        value={filters.product}
        onDraft={() => enable("products")}
        onChange={(product) => onChange({ ...filters, product })}
      />
      <Filters.ResourceFilter
        label="Policy"
        icon={Shield}
        resource="policies"
        options={policies}
        value={filters.policy}
        onDraft={() => enable("policies")}
        onChange={(policy) => onChange({ ...filters, policy })}
      />
      <Filters.ResourceFilter
        label="Owner"
        icon={User}
        resource="users"
        options={users}
        value={filters.owner}
        onDraft={() => enable("users")}
        onChange={(owner) => onChange({ ...filters, owner })}
      />
      <Filters.ResourceFilter
        label="User"
        icon={Users}
        resource="users"
        options={users}
        value={filters.user}
        onDraft={() => enable("users")}
        onChange={(user) => onChange({ ...filters, user })}
      />
      <Filters.ResourceFilter
        label="Group"
        icon={SquareStack}
        resource="groups"
        options={groups}
        value={filters.group}
        onDraft={() => enable("groups")}
        onChange={(group) => onChange({ ...filters, group })}
      />
      <Filters.MetadataFilter
        label="Metadata"
        icon={Braces}
        value={filters.metadata}
        onChange={(metadata) => onChange({ ...filters, metadata })}
      />
    </Filters.FilterBar>
  )
}
