import { Monitor, KeyRound, User, Box } from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListMachines } from "@/queries/machines"
import { useListLicenses } from "@/queries/licenses"
import { useListUsers } from "@/queries/users"
import { useListProducts } from "@/queries/products"
import { type ProcessFilters } from "@/queries/processes"

interface ProcessFilterBarProps {
  filters: ProcessFilters
  onChange: (filters: ProcessFilters) => void
}

export default function ProcessFilterBar({
  filters,
  onChange,
}: ProcessFilterBarProps) {
  const filterCount = Object.values(filters).filter((v) => v != null).length

  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const enable = useCallback((key: string) => {
    setEnabled((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }, [])

  const { data: machines = [] } = useListMachines(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.machines },
  )
  const { data: licenses = [] } = useListLicenses(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.licenses },
  )
  const { data: users = [] } = useListUsers(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.users },
  )
  const { data: products = [] } = useListProducts(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.products },
  )

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({})}
    >
      <Filters.ResourceFilter
        label="Machine"
        icon={Monitor}
        resource="machines"
        options={machines}
        value={filters.machine}
        onDraft={() => enable("machines")}
        onChange={(machine) => onChange({ ...filters, machine })}
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
        icon={User}
        resource="users"
        options={users}
        value={filters.user}
        onDraft={() => enable("users")}
        onChange={(user) => onChange({ ...filters, user })}
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
    </Filters.FilterBar>
  )
}
