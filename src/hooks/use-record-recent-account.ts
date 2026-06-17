import { useEffect } from "react"

import * as keygen from "@/keygen"

import { addRecentAccount } from "@/lib/accounts"
import { useGetAccount } from "@/queries/accounts"

export function useRecordRecentAccount(): void {
  const { data: account } = useGetAccount()

  useEffect(() => {
    if (keygen.config.hasFixedAccount || !account) return

    addRecentAccount({
      id: account.attributes.slug,
      name: account.attributes.name,
    })
  }, [account])
}
