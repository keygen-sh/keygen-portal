import {
  SearchOption,
  SearchOperator,
  SearchableResource,
} from "@/types/search"
import {
  License,
  Group,
  User,
  Machine,
  Entitlement,
  Product,
  Policy,
  Package,
  Release,
  Platform,
  Arch,
} from "@/types"

import { getUserLabel } from "@/lib/users"
import { getGroupLabel } from "@/lib/groups"
import { getLicenseLabel } from "@/lib/licenses"
import { getMachineLabel } from "@/lib/machines"
import { getPackageLabel } from "@/lib/packages"
import { getReleaseLabel } from "@/lib/releases"

import * as keygen from "@/keygen"

import { Badge } from "@/components/ui/badge"
import GoToButton from "@/components/go-to-button"

type NamedSearchOption = SearchOption & { attributes: { name: string } }

const getNamedLabel = (option: NamedSearchOption): string => {
  return option.attributes.name ?? option.id
}

export const getDefaultLabel = (option: SearchOption): string => {
  return option.id
}

export function labelFor(item: { type: string } & SearchOption): string {
  const config = resourceConfigs[item.type as SearchableResource]
  const getLabel = config?.getLabel ?? getDefaultLabel
  return getLabel(item)
}

export interface ResourceConfig<T extends SearchOption = SearchOption> {
  getLabel?(this: void, option: T): string
  renderOption?(this: void, option: T): React.ReactNode
  placeholder: string
  searchPlaceholder: string
  emptyMessage: React.ReactElement
  searchQuery: (term: string) => {
    query: Record<string, string>
    op?: SearchOperator
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
    query: { id: term, name: term },
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

export const packagesConfig: ResourceConfig<Package> = {
  getLabel: getPackageLabel,
  placeholder: "Select a package...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No packages found.
      <GoToButton
        path="/$accountId/app/packages"
        params={{ accountId: keygen.config.id }}
        label="View packages"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term },
    op: "OR",
  }),
}

export const releasesConfig: ResourceConfig<Release> = {
  getLabel: getReleaseLabel,
  renderOption: (release) => {
    const { name, version } = release.attributes
    return (
      <span className="inline-flex items-center gap-2">
        <span>{name ?? getReleaseLabel(release)}</span>
        <Badge variant="secondary" className="text-xs">
          {version}
        </Badge>
      </span>
    )
  },
  placeholder: "Select a release...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: (
    <span className="flex items-center gap-2">
      No releases found.
      <GoToButton
        path="/$accountId/app/releases"
        params={{ accountId: keygen.config.id }}
        label="View releases"
      />
    </span>
  ),
  searchQuery: (term) => ({
    query: { id: term, name: term, version: term },
    op: "OR",
  }),
}

export const platformsConfig: ResourceConfig<Platform> = {
  getLabel: getNamedLabel,
  placeholder: "Select a platform...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: <span>No platforms found.</span>,
  searchQuery: (term) => ({
    query: { id: term, name: term },
    op: "OR",
  }),
}

export const archesConfig: ResourceConfig<Arch> = {
  getLabel: getNamedLabel,
  placeholder: "Select an arch...",
  searchPlaceholder: "Search by ID or name...",
  emptyMessage: <span>No arches found.</span>,
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
  packages: packagesConfig,
  releases: releasesConfig,
  platforms: platformsConfig,
  arches: archesConfig,
}
