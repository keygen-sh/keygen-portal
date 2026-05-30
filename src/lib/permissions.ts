import type { QueryClient } from "@tanstack/react-query"

import { currentUserQueryOptions } from "@/queries/users"

import {
  Permissions,
  Permission,
  DefaultPermissionsByRole,
} from "@/types/users"

import config from "@/keygen/config"

const PERMISSION_SET: ReadonlySet<Permission> = new Set(Permissions)

export function isPermission(value: string): value is Permission {
  return PERMISSION_SET.has(value as Permission)
}

async function effectivePermissions(
  queryClient: QueryClient,
): Promise<ReadonlySet<Permission>> {
  const me = await queryClient.ensureQueryData(currentUserQueryOptions())
  const raw = me.attributes.permissions

  if (raw != null) {
    return new Set(raw.filter(isPermission))
  }

  if (config.isCE) {
    return new Set(DefaultPermissionsByRole[me.attributes.role] ?? [])
  }

  return new Set()
}

export async function requirePermission(
  queryClient: QueryClient,
  permission: Permission,
): Promise<void> {
  const perms = await effectivePermissions(queryClient)
  if (!perms.has(permission)) throw new Error("Permission denied")
}

export async function requireAnyPermission(
  queryClient: QueryClient,
  permissions: readonly Permission[],
): Promise<void> {
  const perms = await effectivePermissions(queryClient)
  if (!permissions.some((p) => perms.has(p))) {
    throw new Error("Permission denied")
  }
}

export async function requireAllPermissions(
  queryClient: QueryClient,
  permissions: readonly Permission[],
): Promise<void> {
  const perms = await effectivePermissions(queryClient)
  if (!permissions.every((p) => perms.has(p))) {
    throw new Error("Permission denied")
  }
}
