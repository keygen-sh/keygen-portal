import { useEffect } from "react"

import * as keygen from "@/keygen"

import { addRecentAccount } from "@/lib/accounts"
import { useGetAccount } from "@/queries/accounts"

export function useRecordRecentAccount(): void {
  const { data: account } = useGetAccount()

  useEffect(() => {
    if (keygen.config.hasFixedAccount || !account) return

    const { slug, name } = account.attributes
    if (!name) return

    addRecentAccount({ id: account.id, slug, name })
  }, [account])
}
