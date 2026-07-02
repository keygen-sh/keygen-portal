import { useMemo } from "react"
import { KeyRound, Shield } from "lucide-react"

import * as Filters from "@/components/filter-bar"

import { useEdition } from "@/hooks/use-edition"
import { useEnvironment } from "@/hooks/use-environment"

import {
  TokenBearerType,
  TokenRole,
  TokenRoleLabels,
  AllTokenRoles,
  type TokenFilters,
} from "@/types/tokens"

interface TokenFilterBarProps {
  filters: TokenFilters
  onChange: (filters: TokenFilters) => void
}

export default function TokenFilterBar({
  filters,
  onChange,
}: TokenFilterBarProps) {
  const { isCE } = useEdition()
  const { id: environmentId } = useEnvironment()

  const bearerTypes = useMemo(
    () =>
      [
        { value: TokenBearerType.User, label: "User", resource: "users" },
        {
          value: TokenBearerType.License,
          label: "License",
          resource: "licenses",
        },
        {
          value: TokenBearerType.Product,
          label: "Product",
          resource: "products",
        },
        // environment tokens are only visible inside their own environment, so
        // the bearer can only ever be the current environment. in addition, we
        // want to hide the option in the global env and in CE.
        ...(environmentId != null
          ? [
              {
                value: TokenBearerType.Environment,
                label: "Environment",
                fixed: environmentId,
              },
            ]
          : []),
      ] satisfies ReadonlyArray<Filters.PolymorphicResourceType>,
    [environmentId],
  )

  // environments are EE-only, so hide the environment role in CE
  const availableRoles = useMemo(
    () =>
      isCE
        ? AllTokenRoles.filter((role) => role !== TokenRole.Environment)
        : AllTokenRoles,
    [isCE],
  )

  const roleOptions = useMemo(
    () =>
      availableRoles.map((role) => ({
        value: role,
        label: TokenRoleLabels[role],
      })),
    [availableRoles],
  )

  const roles = (filters.bearerRoles ?? [...availableRoles]).filter((role) =>
    availableRoles.includes(role),
  )
  const allRolesSelected = roles.length === availableRoles.length

  const filterCount = (filters.bearerId ? 1 : 0) + (allRolesSelected ? 0 : 1)

  const bearerValue =
    filters.bearerType && filters.bearerId
      ? { type: filters.bearerType, id: filters.bearerId }
      : undefined

  return (
    <Filters.FilterBar
      filterCount={filterCount}
      onClearAll={() => onChange({ bearerRoles: [...availableRoles] })}
    >
      <Filters.PolymorphicResourceFilter
        label="Bearer"
        icon={KeyRound}
        types={bearerTypes}
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
        options={roleOptions}
        value={allRolesSelected ? undefined : roles}
        onChange={(next) =>
          onChange({
            ...filters,
            bearerRoles: (next as TokenRole[] | undefined) ?? [
              ...availableRoles,
            ],
          })
        }
      />
    </Filters.FilterBar>
  )
}
