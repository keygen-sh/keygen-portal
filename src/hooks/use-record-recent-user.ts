import { useEffect } from "react"

import { setRecentUser } from "@/lib/users"
import { useGetCurrentUser } from "@/queries/users"

export function useRecordRecentUser(): void {
  const { data: user } = useGetCurrentUser()

  useEffect(() => {
    if (!user) return

    const { firstName } = user.attributes
    if (!firstName) return

    setRecentUser({ firstName })
  }, [user])
}
