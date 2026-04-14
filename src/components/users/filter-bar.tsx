import {
  CircleDot,
  UserCheck,
  Box,
  SquareStack,
  Shield,
  Braces,
} from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { useListGroups } from "@/queries/groups"
import {
  UserStatus,
  UserStatusLabels,
  UserRole,
  UserRoleLabels,
  AllRoles,
} from "@/types/users"
import { type UserFilters } from "@/queries/users"

const STATUS_OPTIONS = Object.values(UserStatus).map((status) => ({
  label: UserStatusLabels[status],
  value: status,
}))

const ROLE_OPTIONS = Object.values(UserRole).map((role) => ({
  label: UserRoleLabels[role],
  value: role,
}))

interface UserFilterBarProps {
  filters: UserFilters
  onChange: (filters: UserFilters) => void
}

export default function UserFilterBar({
  filters,
  onChange,
}: UserFilterBarProps) {
  const filterCount = Object.entries(filters).filter(([k, v]) => {
    if (v == null) {
      return false
    }

    // NB(ezekg) the "unset" value of roles is to include all roles since the default is ["user"]
    if (k === "roles") {
      return Array.isArray(v) && v.length !== AllRoles.length
    }

    return true
  }).length

  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const enable = useCallback((key: string) => {
    setEnabled((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }, [])

  const { data: products = [] } = useListProducts(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.products },
  )
  const { data: groups = [] } = useListGroups(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.groups },
  )

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({ roles: AllRoles })}
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
      <Filters.BooleanFilter
        label="Assigned"
        icon={UserCheck}
        value={filters.assigned}
        onChange={(assigned) => onChange({ ...filters, assigned })}
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
        label="Group"
        icon={SquareStack}
        resource="groups"
        options={groups}
        value={filters.group}
        onDraft={() => enable("groups")}
        onChange={(group) => onChange({ ...filters, group })}
      />
      <Filters.ArrayFilter
        label="Roles"
        icon={Shield}
        options={ROLE_OPTIONS}
        value={
          filters.roles?.length === AllRoles.length ? undefined : filters.roles
        }
        onChange={(roles) => onChange({ ...filters, roles: roles ?? AllRoles })}
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
