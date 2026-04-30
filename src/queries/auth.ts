import { useMutation, useQueryClient } from "@tanstack/react-query"

import * as keygen from "@/keygen"
import { useSession } from "@/hooks/use-session"

export function useLogout() {
  const queryClient = useQueryClient()
  const { setUser } = useSession()

  return useMutation({
    mutationFn: keygen.logout,
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
    },
  })
}
