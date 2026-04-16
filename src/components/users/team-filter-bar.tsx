import { Shield, Braces } from "lucide-react"

import * as Filters from "@/components/filter-bar"

import { UserRoleLabels, InternalRoles, type UserFilters } from "@/types/users"

const ROLE_OPTIONS = InternalRoles.map((role) => ({
  label: UserRoleLabels[role],
  value: role,
}))

interface TeamFilterBarProps {
  filters: UserFilters
  onChange: (filters: UserFilters) => void
}

export default function TeamFilterBar({
  filters,
  onChange,
}: TeamFilterBarProps) {
  const filterCount = Object.entries(filters).filter(([k, v]) => {
    if (v == null) {
      return false
    }

    if (k === "roles") {
      return Array.isArray(v) && v.length !== InternalRoles.length
    }

    return true
  }).length

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({ roles: InternalRoles })}
    >
      <Filters.ArrayFilter
        label="Roles"
        icon={Shield}
        options={ROLE_OPTIONS}
        value={
          filters.roles?.length === InternalRoles.length
            ? undefined
            : filters.roles
        }
        onChange={(roles) =>
          onChange({ ...filters, roles: roles ?? InternalRoles })
        }
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
