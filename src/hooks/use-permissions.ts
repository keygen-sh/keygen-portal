import { useContext } from "react"

import { PermissionsContext } from "@/contexts/permissions-context"

export function usePermissions() {
  return useContext(PermissionsContext)
}
