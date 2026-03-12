import { SearchableResource, SearchOption } from "@/types/search"

import { getUserLabel } from "@/lib/users"
import { getGroupLabel } from "@/lib/groups"
import { getLicenseLabel } from "@/lib/licenses"
import { getMachineLabel } from "@/lib/machines"

import * as keygen from "@/keygen"

import GoToButton from "@/components/go-to-button"

type NamedSearchOption = SearchOption & { attributes: { name: string } }

export function getDefaultLabel<T extends SearchOption>(option: T): string {
  if (
    "attributes" in option &&
    typeof (option as NamedSearchOption).attributes?.name === "string"
  ) {
    return (option as NamedSearchOption).attributes.name
  }
  return option.id
}

interface ResourceConfig {
  getLabel: (option: SearchOption) => string
  placeholder: string
  searchPlaceholder: string
  emptyMessage: React.ReactElement
  searchQuery: (term: string) => {
    query: Record<string, string>
    op?: "AND" | "OR"
  }
}

export const resourceConfigs: Record<SearchableResource, ResourceConfig> = {
  licenses: {
    getLabel: getLicenseLabel as (option: SearchOption) => string,
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
  },
  groups: {
    getLabel: getGroupLabel as (option: SearchOption) => string,
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
  },
  users: {
    getLabel: getUserLabel as (option: SearchOption) => string,
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
  },
  machines: {
    getLabel: getMachineLabel as (option: SearchOption) => string,
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
  },
  entitlements: {
    getLabel: (option) =>
      (option as NamedSearchOption).attributes?.name ?? option.id,
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
  },
  products: {
    getLabel: (option) =>
      (option as NamedSearchOption).attributes?.name ?? option.id,
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
  },
  policies: {
    getLabel: (option) =>
      (option as NamedSearchOption).attributes?.name ?? option.id,
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
  },
}
