import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import * as keygen from "@/keygen"
import { useSession } from "@/hooks/use-session"

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setUser } = useSession()

  return useMutation({
    mutationFn: keygen.logout,
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
      void navigate({
        to: "/$accountId/auth/login",
        params: { accountId: keygen.config.id },
        replace: true,
      })
    },
  })
}
