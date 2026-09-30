import { useMemo } from "react"

import { useGetAccountSettings } from "@/queries/accounts"

import { LicenseDefaultPermissions } from "@/types/licenses"

export function useAccountDefaultLicensePermissions(): readonly string[] {
  const { data: settings = [] } = useGetAccountSettings()

  return useMemo(() => {
    const value = settings.find(
      (s) => s.attributes.key === "default_license_permissions",
    )?.attributes.value

    return value?.length ? value : LicenseDefaultPermissions
  }, [settings])
}
