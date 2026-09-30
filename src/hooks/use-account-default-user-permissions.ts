import { useMemo } from "react"

import { useGetAccountSettings } from "@/queries/accounts"

import { UserDefaultPermissions } from "@/types/users"

export function useAccountDefaultUserPermissions(): readonly string[] {
  const { data: settings = [] } = useGetAccountSettings()

  return useMemo(() => {
    const value = settings.find(
      (s) => s.attributes.key === "default_user_permissions",
    )?.attributes.value

    return value?.length ? value : UserDefaultPermissions
  }, [settings])
}
