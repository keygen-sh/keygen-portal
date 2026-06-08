import { Box, Package } from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { PackageEngine, PackageEngineLabels } from "@/types/packages"
import { type PackageFilters } from "@/queries/packages"

const ENGINE_OPTIONS = Object.values(PackageEngine).map((engine) => ({
  label: PackageEngineLabels[engine],
  value: engine,
}))

interface PackageFilterBarProps {
  filters: PackageFilters
  onChange: (filters: PackageFilters) => void
}

export default function PackageFilterBar({
  filters,
  onChange,
}: PackageFilterBarProps) {
  const filterCount = Object.values(filters).filter((v) => v != null).length

  // NB(ezekg) lazy queries that only pop off on first resource filter activation
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const enable = useCallback((key: string) => {
    setEnabled((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }, [])

  const { data: products = [] } = useListProducts(
    { cursor: "", pageSize: 10 },
    { enabled: !!enabled.products },
  )

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({})}
    >
      <Filters.ResourceFilter
        label="Product"
        icon={Box}
        resource="products"
        options={products}
        value={filters.product}
        onDraft={() => enable("products")}
        onChange={(product) => onChange({ ...filters, product })}
      />
      <Filters.EnumFilter
        label="Engine"
        icon={Package}
        options={ENGINE_OPTIONS}
        value={filters.engine}
        onChange={(engine) => onChange({ ...filters, engine })}
      />
    </Filters.FilterBar>
  )
}
