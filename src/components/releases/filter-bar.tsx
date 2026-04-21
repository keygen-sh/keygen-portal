import { CircleDot, Hash, Box, Package, Cog, ShieldAlert } from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { useListPackages } from "@/queries/packages"
import { useListEntitlements } from "@/queries/entitlements"
import {
  ReleaseStatus,
  ReleaseStatusLabels,
  ReleaseChannel,
  ReleaseChannelLabels,
} from "@/types/releases"
import { PackageEngine, PackageEngineLabels } from "@/types/packages"
import { type ReleaseFilters } from "@/queries/releases"

const STATUS_OPTIONS = Object.values(ReleaseStatus).map((status) => ({
  label: ReleaseStatusLabels[status],
  value: status,
}))

const CHANNEL_OPTIONS = Object.values(ReleaseChannel).map((channel) => ({
  label: ReleaseChannelLabels[channel],
  value: channel,
}))

const ENGINE_OPTIONS = Object.values(PackageEngine).map((engine) => ({
  label: PackageEngineLabels[engine],
  value: engine,
}))

interface ReleaseFilterBarProps {
  filters: ReleaseFilters
  onChange: (filters: ReleaseFilters) => void
}

export default function ReleaseFilterBar({
  filters,
  onChange,
}: ReleaseFilterBarProps) {
  const filterCount = Object.values(filters).filter((v) => v != null).length

  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const enable = useCallback((key: string) => {
    setEnabled((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }, [])

  const { data: products = [] } = useListProducts(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.products },
  )
  const { data: packages = [] } = useListPackages(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.packages },
  )
  const { data: entitlements = [] } = useListEntitlements(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.entitlements },
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
      <Filters.EnumFilter
        label="Channel"
        icon={Hash}
        options={CHANNEL_OPTIONS}
        value={filters.channel}
        onChange={(channel) => onChange({ ...filters, channel })}
      />
      <Filters.EnumFilter
        label="Engine"
        icon={Cog}
        options={ENGINE_OPTIONS}
        value={filters.engine}
        onChange={(engine) => onChange({ ...filters, engine })}
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
        label="Package"
        icon={Package}
        resource="packages"
        options={packages}
        value={filters.package}
        onDraft={() => enable("packages")}
        onChange={(pkg) => onChange({ ...filters, package: pkg })}
      />
      <Filters.ResourcesFilter
        label="Entitlements"
        icon={ShieldAlert}
        resource="entitlements"
        options={entitlements}
        value={filters.entitlements}
        onDraft={() => enable("entitlements")}
        onChange={(entitlements) => onChange({ ...filters, entitlements })}
      />
    </Filters.FilterBar>
  )
}
