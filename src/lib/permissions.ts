import type { QueryClient } from "@tanstack/react-query"

import { currentUserQueryOptions } from "@/queries/users"

import {
  UserRole,
  Permission,
  Permissions,
  InternalRoles,
  WildcardPermission,
  DefaultPermissionsByRole,
  AllowedPermissionsByRole,
  PortalRequiredPermissions,
} from "@/types/users"

import config from "@/keygen/config"

const PERMISSION_SET: ReadonlySet<Permission> = new Set(Permissions)

export function isPermission(value: string): value is Permission {
  return PERMISSION_SET.has(value as Permission)
}

// narrow a permission set down to the permissions a given role is allowed to hold
export function permissionsForRole(
  permissions: Iterable<string> | null | undefined,
  role: UserRole | null | undefined,
): string[] | null {
  if (permissions == null) {
    return null
  }

  const selected = new Set(permissions)

  if (selected.has(WildcardPermission)) {
    return [WildcardPermission]
  }

  const allowed: readonly Permission[] =
    role != null ? AllowedPermissionsByRole[role] : Permissions

  return allowed.filter((permission) => selected.has(permission))
}

export type PermissionPreset = "all" | "role" | "required" | "none" | "custom"

// determine which preset a given permission set matches, if any
export function permissionPreset(
  value: readonly string[] | null | undefined,
  {
    grantable,
    defaults,
    required = [],
  }: {
    grantable: readonly string[]
    defaults: readonly string[]
    required?: readonly string[]
  },
): PermissionPreset | undefined {
  if (value == null) {
    return undefined
  }

  if (
    value.includes(WildcardPermission) ||
    (grantable.length > 0 && grantable.every((v) => value.includes(v)))
  ) {
    return "all"
  }

  if (value.length === 0) {
    return "none"
  }

  const matches = (preset: readonly string[]) =>
    preset.length > 0 &&
    value.length === preset.length &&
    preset.every((v) => value.includes(v))

  if (matches(required)) {
    return "required"
  }

  if (matches(defaults)) {
    return "role"
  }

  return "custom"
}

// default permission set for a role
export function defaultPermissionsFor(
  role: UserRole,
  accountDefaults?: readonly string[],
): readonly string[] {
  const defaults =
    role === UserRole.User && accountDefaults != null
      ? accountDefaults
      : DefaultPermissionsByRole[role]

  if (!InternalRoles.includes(role)) {
    return defaults
  }

  return [...new Set([...defaults, ...PortalRequiredPermissions])]
}

// a role's defaults narrowed to the permissions the current user holds
// e.g. if current user isn't an admin, they can only grant permissions they hold
function rolePermissionsFor(
  role: UserRole,
  currentPermissions: ReadonlySet<string>,
  accountDefaults?: readonly string[],
): string[] {
  return defaultPermissionsFor(role, accountDefaults).filter((p) =>
    currentPermissions.has(p),
  )
}

// reseed a permission selection when the role changes
export function nextPermissionsForRoleChange({
  value,
  from,
  to,
  currentPermissions,
  accountDefaults,
}: {
  value: string[] | null | undefined
  from: UserRole
  to: UserRole
  currentPermissions: ReadonlySet<string>
  accountDefaults?: readonly string[]
}): string[] | null | undefined {
  if (value == null) {
    return undefined
  }

  const selected = new Set(value)
  const grantable = Permissions.filter(
    (p) => currentPermissions.has(p) || selected.has(p),
  )
  const grantableSet = new Set<string>(grantable)

  const required = InternalRoles.includes(from)
    ? PortalRequiredPermissions.filter((p) => currentPermissions.has(p))
    : []
  const preset = permissionPreset(value, {
    grantable,
    defaults: defaultPermissionsFor(from, accountDefaults).filter((p) =>
      grantableSet.has(p),
    ),
    required,
  })

  if (preset === "custom") {
    return undefined
  }

  const next = rolePermissionsFor(to, currentPermissions, accountDefaults)

  return next.length > 0 ? next : null
}

// resolve a permission set into a normalized set of permissions,
// considering the user's role and whether we're in CE or EE
export function resolvePermissions(
  raw: readonly string[] | null | undefined,
  role: UserRole | null | undefined,
): ReadonlySet<Permission> {
  if (raw != null) {
    if (raw.includes(WildcardPermission)) {
      return new Set(role != null ? AllowedPermissionsByRole[role] : [])
    }

    return new Set(raw.filter(isPermission))
  }

  if (config.isCE && role != null) {
    return new Set(DefaultPermissionsByRole[role])
  }

  return new Set()
}

async function effectivePermissions(
  queryClient: QueryClient,
): Promise<ReadonlySet<Permission>> {
  const me = await queryClient.ensureQueryData(currentUserQueryOptions())

  return resolvePermissions(me.attributes.permissions, me.attributes.role)
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
