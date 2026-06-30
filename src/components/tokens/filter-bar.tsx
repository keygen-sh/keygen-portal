import { KeyRound, Shield } from "lucide-react"

import * as Filters from "@/components/filter-bar"

import config from "@/keygen/config"

import {
  TokenBearerType,
  TokenRole,
  TokenRoleLabels,
  AllTokenRoles,
  type TokenFilters,
} from "@/types/tokens"

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

const ROLE_OPTIONS = AllTokenRoles.map((role) => ({
  value: role,
  label: TokenRoleLabels[role],
}))

interface TokenFilterBarProps {
  filters: TokenFilters
  onChange: (filters: TokenFilters) => void
}

export default function TokenFilterBar({
  filters,
  onChange,
}: TokenFilterBarProps) {
  const roles = filters.bearerRoles ?? [...AllTokenRoles]
  const allRolesSelected = roles.length === AllTokenRoles.length

  const filterCount = (filters.bearerId ? 1 : 0) + (allRolesSelected ? 0 : 1)

  const bearerValue =
    filters.bearerType && filters.bearerId
      ? { type: filters.bearerType, id: filters.bearerId }
      : undefined

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({ bearerRoles: [...AllTokenRoles] })}
    >
      <Filters.PolymorphicResourceFilter
        label="Bearer"
        icon={KeyRound}
        placeholder="Bearer ID"
        types={BEARER_TYPES}
        value={bearerValue}
        onChange={(next) =>
          onChange({
            ...filters,
            bearerType: next?.type as TokenBearerType | undefined,
            bearerId: next?.id,
          })
        }
      />
      <Filters.ArrayFilter
        label="Role"
        icon={Shield}
        options={ROLE_OPTIONS}
        value={allRolesSelected ? undefined : roles}
        onChange={(next) =>
          onChange({
            ...filters,
            bearerRoles: (next as TokenRole[] | undefined) ?? [
              ...AllTokenRoles,
            ],
          })
        }
      />
    </Filters.FilterBar>
  )
}
