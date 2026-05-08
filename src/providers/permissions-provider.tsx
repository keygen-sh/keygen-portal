import { useMemo } from "react"

import { PermissionsContext } from "@/contexts/permissions-context"

import { useGetCurrentUser } from "@/queries/users"

import { type Permission } from "@/types/users"

import { isPermission } from "@/lib/permissions"

import * as Loading from "@/components/loading"

interface PermissionsProviderProps {
  children: React.ReactNode
}

export function PermissionsProvider({
  children,
}: PermissionsProviderProps): React.ReactElement {
  const { data: currentUser, isLoading } = useGetCurrentUser()

  const value = useMemo(() => {
    const permissions: ReadonlySet<Permission> = new Set(
      (currentUser?.attributes.permissions ?? []).filter(isPermission),
    )

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
