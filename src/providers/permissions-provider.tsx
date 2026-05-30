import { useMemo } from "react"

import { PermissionsContext } from "@/contexts/permissions-context"

import { useGetCurrentUser } from "@/queries/users"

import { type Permission, DefaultPermissionsByRole } from "@/types/users"

import { isPermission } from "@/lib/permissions"

import config from "@/keygen/config"

import * as Loading from "@/components/loading"

interface PermissionsProviderProps {
  children: React.ReactNode
}

export function PermissionsProvider({
  children,
}: PermissionsProviderProps): React.ReactElement {
  const { data: currentUser, isLoading } = useGetCurrentUser()

  const value = useMemo(() => {
    const raw = currentUser?.attributes.permissions

    let permissions: ReadonlySet<Permission>
    if (raw != null) {
      permissions = new Set(raw.filter(isPermission))
    } else if (config.isCE && currentUser?.attributes.role != null) {
      permissions = new Set(
        DefaultPermissionsByRole[currentUser.attributes.role] ?? [],
      )
    } else {
      permissions = new Set()
    }

    return {
      permissions,
      isLoading,
      can: (perm: Permission) => permissions.has(perm),
      canAny: (perms: readonly Permission[]) =>
        perms.some((p) => permissions.has(p)),
      canAll: (perms: readonly Permission[]) =>
        perms.every((p) => permissions.has(p)),
    }
  }, [currentUser, isLoading])

  if (!currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loading.Dots />
      </div>
    )
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}
