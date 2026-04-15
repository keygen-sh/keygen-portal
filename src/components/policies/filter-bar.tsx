import { Box } from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { type PolicyFilters } from "@/queries/policies"

interface PolicyFilterBarProps {
  filters: PolicyFilters
  onChange: (filters: PolicyFilters) => void
}

export default function PolicyFilterBar({
  filters,
  onChange,
}: PolicyFilterBarProps) {
  const filterCount = Object.values(filters).filter((v) => v != null).length

  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const enable = useCallback((key: string) => {
    setEnabled((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }, [])

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
