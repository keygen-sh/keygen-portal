import { useListEntitlements } from "@/queries/entitlements"
import { useListGroups } from "@/queries/groups"
import { useListLicenses } from "@/queries/licenses"
import { useListMachines } from "@/queries/machines"
import { useListPolicies } from "@/queries/policies"
import { useListProducts } from "@/queries/products"
import { useListReleases } from "@/queries/releases"
import { useListUsers } from "@/queries/users"

import type { AnyResource } from "@/types/api"
import type { CommandSearchResource } from "@/types/palette"

const PAGE_SIZE = 8

export function useTypeBrowseData(type: CommandSearchResource): {
  data: AnyResource[]
} {
  const licenses = useListLicenses(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "licenses" },
  )
  const users = useListUsers(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "users" },
  )
  const groups = useListGroups(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "groups" },
  )
  const machines = useListMachines(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "machines" },
  )
  const entitlements = useListEntitlements(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "entitlements" },
  )
  const products = useListProducts(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "products" },
  )
  const policies = useListPolicies(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "policies" },
  )
  const releases = useListReleases(
    { page: 1, pageSize: PAGE_SIZE },
    { enabled: type === "releases" },
  )

  switch (type) {
    case "licenses":
      return { data: licenses.data }
    case "users":
      return { data: users.data }
    case "groups":
      return { data: groups.data }
    case "machines":
      return { data: machines.data }
    case "entitlements":
      return { data: entitlements.data }
    case "products":
      return { data: products.data }
    case "policies":
      return { data: policies.data }
    case "releases":
      return { data: releases.data }
  }
}
