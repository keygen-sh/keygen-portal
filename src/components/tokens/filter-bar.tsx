import { KeyRound } from "lucide-react"

import * as Filters from "@/components/filter-bar"

import config from "@/keygen/config"

import { TokenBearerType, type TokenFilters } from "@/types/tokens"

const BEARER_TYPES: ReadonlyArray<{
  value: TokenBearerType
  label: string
  resource?: "users" | "licenses" | "products"
}> = [
  { value: TokenBearerType.User, label: "User", resource: "users" },
  { value: TokenBearerType.License, label: "License", resource: "licenses" },
  { value: TokenBearerType.Product, label: "Product", resource: "products" },
  ...(config.isCE
    ? []
    : [{ value: TokenBearerType.Environment, label: "Environment" }]),
]

interface TokenFilterBarProps {
  filters: TokenFilters
  onChange: (filters: TokenFilters) => void
}

export default function TokenFilterBar({
  filters,
  onChange,
}: TokenFilterBarProps) {
  const filterCount = filters.bearerId ? 1 : 0

  const value =
    filters.bearerType && filters.bearerId
      ? { type: filters.bearerType, id: filters.bearerId }
      : undefined

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({})}
    >
      <Filters.PolymorphicResourceFilter
        label="Bearer"
        icon={KeyRound}
        placeholder="Bearer ID"
        types={BEARER_TYPES}
        value={value}
        onChange={(next) =>
          onChange(
            next
              ? { bearerType: next.type as TokenBearerType, bearerId: next.id }
              : {},
          )
        }
      />
    </Filters.FilterBar>
  )
}
