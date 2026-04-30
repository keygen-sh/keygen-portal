import { useContext } from "react"

import { SessionContext } from "@/contexts/session-context"

export function useSession() {
  return useContext(SessionContext)
}
