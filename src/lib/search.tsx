import { SearchableResource, SearchOption } from "@/types/search"
import {
  License,
  Group,
  User,
  Machine,
  Entitlement,
  Product,
  Policy,
} from "@/types"

import { getUserLabel } from "@/lib/users"
import { getGroupLabel } from "@/lib/groups"
import { getLicenseLabel } from "@/lib/licenses"
import { getMachineLabel } from "@/lib/machines"

import * as keygen from "@/keygen"

import GoToButton from "@/components/go-to-button"

type NamedSearchOption = SearchOption & { attributes: { name: string } }

const getNamedLabel = (option: NamedSearchOption): string => {
  return option.attributes.name ?? option.id
}

export const getDefaultLabel = (option: SearchOption): string => {
  return option.id
}

export interface ResourceConfig<T extends SearchOption = SearchOption> {
  getLabel?(this: void, option: T): string
  placeholder: string
  searchPlaceholder: string
  emptyMessage: React.ReactElement
  searchQuery: (term: string) => {
    query: Record<string, string>
    op?: "AND" | "OR"
  }
}

export const licensesConfig: ResourceConfig<License> = {
  getLabel: getLicenseLabel,
  placeholder: "Select a license...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No licenses found.
      <GoToButton
        path="/$accountId/app/licenses"
        params={{ accountId: keygen.config.id }}
        label="View licenses"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term, key: term },
    op: "OR",
  }),
}

export const groupsConfig: ResourceConfig<Group> = {
  getLabel: getGroupLabel,
  placeholder: "Select a group...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No groups found.
      <GoToButton
        path="/$accountId/app/groups"
        params={{ accountId: keygen.config.id }}
        label="View groups"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term },
    op: "OR",
  }),
}

export const usersConfig: ResourceConfig<User> = {
  getLabel: getUserLabel,
  placeholder: "Select an owner...",
  searchPlaceholder: "Search by ID or email...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No users found.
      <GoToButton
        path="/$accountId/app/users"
        params={{ accountId: keygen.config.id }}
        label="View users"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, email: term, firstName: term, lastName: term },
    op: "OR",
  }),
}

export const machinesConfig: ResourceConfig<Machine> = {
  getLabel: getMachineLabel,
  placeholder: "Select a machine...",
  searchPlaceholder: "Search by ID, name, or fingerprint...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No machines found.
      <GoToButton
        path="/$accountId/app/machines"
        params={{ accountId: keygen.config.id }}
        label="View machines"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term, fingerprint: term },
    op: "OR",
  }),
}

export const entitlementsConfig: ResourceConfig<Entitlement> = {
  getLabel: getNamedLabel,
  placeholder: "Select an entitlement...",
  searchPlaceholder: "Search by ID, name, or code...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No entitlements found.
      <GoToButton
        path="/$accountId/app/entitlements"
        params={{ accountId: keygen.config.id }}
        label="View entitlements"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term, code: term },
    op: "OR",
  }),
}

export const productsConfig: ResourceConfig<Product> = {
  getLabel: getNamedLabel,
  placeholder: "Select a product...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No products found.
      <GoToButton
        path="/$accountId/app/products"
        params={{ accountId: keygen.config.id }}
        label="View products"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term },
    op: "OR",
  }),
}

export const policiesConfig: ResourceConfig<Policy> = {
  getLabel: getNamedLabel,
  placeholder: "Select a policy...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No policies found.
      <GoToButton
        path="/$accountId/app/policies"
        params={{ accountId: keygen.config.id }}
        label="View policies"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term },
    op: "OR",
  }),
}

export const resourceConfigs: Record<SearchableResource, ResourceConfig> = {
  licenses: licensesConfig,
  groups: groupsConfig,
  users: usersConfig,
  machines: machinesConfig,
  entitlements: entitlementsConfig,
  products: productsConfig,
  policies: policiesConfig,
}
