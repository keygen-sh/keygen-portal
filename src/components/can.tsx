import { usePermissions } from "@/hooks/use-permissions"

import type { Permission } from "@/types/users"

interface CanProps {
  permission: Permission
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface CanAnyProps {
  permissions: readonly Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface CanAllProps {
  permissions: readonly Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

function Can({
  permission,
  fallback = null,
  children,
}: CanProps): React.ReactNode {
  const { can, isLoading } = usePermissions()
  if (isLoading) return fallback
  return can(permission) ? children : fallback
}

function Any({
  permissions,
  fallback = null,
  children,
}: CanAnyProps): React.ReactNode {
  const { canAny, isLoading } = usePermissions()
  if (isLoading) return fallback
  return canAny(permissions) ? children : fallback
}

function All({
  permissions,
  fallback = null,
  children,
}: CanAllProps): React.ReactNode {
  const { canAll, isLoading } = usePermissions()
  if (isLoading) return fallback
  return canAll(permissions) ? children : fallback
}

Can.Any = Any
Can.All = All

export default Can
