import { createContext } from "react"

import type { Permission } from "@/types/users"

export interface PermissionsContextValue {
  permissions: ReadonlySet<Permission>
  isLoading: boolean
  can: (permission: Permission) => boolean
  canAny: (permissions: readonly Permission[]) => boolean
  canAll: (permissions: readonly Permission[]) => boolean
}

export const PermissionsContext = createContext<PermissionsContextValue>({
  permissions: new Set(),
  isLoading: true,
  can: () => false,
  canAny: () => false,
  canAll: () => false,
})
