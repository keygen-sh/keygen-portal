import {
  CircleDot,
  Fingerprint,
  Globe,
  Monitor,
  Box,
  Shield,
  KeyRound,
  User,
  Users,
  SquareStack,
  Braces,
} from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { useListPolicies } from "@/queries/policies"
import { useListLicenses } from "@/queries/licenses"
import { useListUsers } from "@/queries/users"
import { useListGroups } from "@/queries/groups"
import { type MachineFilters } from "@/queries/machines"
import { HeartbeatStatus } from "@/types/machines"

const STATUS_OPTIONS = [
  { label: "Alive", value: HeartbeatStatus.Alive },
  { label: "Dead", value: HeartbeatStatus.Dead },
]

interface MachineFilterBarProps {
  filters: MachineFilters
  onChange: (filters: MachineFilters) => void
}

export default function MachineFilterBar({
  filters,
  onChange,
}: MachineFilterBarProps) {
  const filterCount = Object.values(filters).filter((v) => v != null).length

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
  const { data: licenses = [] } = useListLicenses(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.licenses },
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
      <Filters.StringFilter
        label="Fingerprint"
        icon={Fingerprint}
        placeholder="e.g. 4d:Eq:UV:D3:XZ..."
        value={filters.fingerprint}
        onChange={(fingerprint) => onChange({ ...filters, fingerprint })}
      />
      <Filters.StringFilter
        label="IP"
        icon={Globe}
        placeholder="e.g. 192.168.1.1"
        value={filters.ip}
        onChange={(ip) => onChange({ ...filters, ip })}
      />
      <Filters.StringFilter
        label="Hostname"
        icon={Monitor}
        placeholder="e.g. torvalds"
        value={filters.hostname}
        onChange={(hostname) => onChange({ ...filters, hostname })}
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
        label="License"
        icon={KeyRound}
        resource="licenses"
        options={licenses}
        onDraft={() => enable("licenses")}
        value={filters.license}
        onChange={(license) => onChange({ ...filters, license })}
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
