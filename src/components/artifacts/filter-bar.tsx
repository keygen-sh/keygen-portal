import { CircleDot, Box, Package, Hash, File, Monitor, Cpu } from "lucide-react"

import { useState, useCallback } from "react"

import * as Filters from "@/components/filter-bar"

import { useListProducts } from "@/queries/products"
import { useListReleases } from "@/queries/releases"
import { useListPlatforms } from "@/queries/platforms"
import { useListArches } from "@/queries/arches"
import { ArtifactStatus, ArtifactStatusLabels } from "@/types/artifacts"
import { ReleaseChannel, ReleaseChannelLabels } from "@/types/releases"
import { type ArtifactFilters } from "@/queries/artifacts"

const STATUS_OPTIONS = Object.values(ArtifactStatus).map((status) => ({
  label: ArtifactStatusLabels[status],
  value: status,
}))

const CHANNEL_OPTIONS = Object.values(ReleaseChannel).map((channel) => ({
  label: ReleaseChannelLabels[channel],
  value: channel,
}))

interface ArtifactFilterBarProps {
  filters: ArtifactFilters
  onChange: (filters: ArtifactFilters) => void
}

export default function ArtifactFilterBar({
  filters,
  onChange,
}: ArtifactFilterBarProps) {
  const filterCount = Object.values(filters).filter((v) => v != null).length

  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const enable = useCallback((key: string) => {
    setEnabled((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }, [])

  const { data: products = [] } = useListProducts(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.products },
  )
  const { data: releases = [] } = useListReleases(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.releases },
  )
  const { data: platforms = [] } = useListPlatforms(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.platforms },
  )
  const { data: arches = [] } = useListArches(
    { page: 1, pageSize: 10 },
    { enabled: !!enabled.arches },
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
        label="Release"
        icon={Package}
        resource="releases"
        options={releases}
        value={filters.release}
        onDraft={() => enable("releases")}
        onChange={(release) => onChange({ ...filters, release })}
      />
      <Filters.EnumFilter
        label="Channel"
        icon={Hash}
        options={CHANNEL_OPTIONS}
        value={filters.channel}
        onChange={(channel) => onChange({ ...filters, channel })}
      />
      <Filters.ResourceFilter
        label="Platform"
        icon={Monitor}
        resource="platforms"
        options={platforms}
        value={filters.platform}
        onDraft={() => enable("platforms")}
        onChange={(platform) => onChange({ ...filters, platform })}
      />
      <Filters.ResourceFilter
        label="Arch"
        icon={Cpu}
        resource="arches"
        options={arches}
        value={filters.arch}
        onDraft={() => enable("arches")}
        onChange={(arch) => onChange({ ...filters, arch })}
      />
      <Filters.StringFilter
        label="Filetype"
        icon={File}
        placeholder="e.g. zip"
        value={filters.filetype}
        onChange={(filetype) => onChange({ ...filters, filetype })}
      />
    </Filters.FilterBar>
  )
}
