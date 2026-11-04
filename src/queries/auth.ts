import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import * as keygen from "@/keygen"
import { useSession } from "@/hooks/use-session"

import { APIError } from "@/types/api"
import { AuthErrorCode } from "@/types/auth"

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

export function useGetReauthenticationMethod(email: string) {
  return useQuery({
    queryKey: ["auth", "reauthentication", email],
    queryFn: async () => {
      const { errors } = await keygen.reauthenticate({ email })

      if (!errors?.length) {
        throw new Error("Service is unavailable.")
      }

      const error = errors[0] as APIError & {
        links?: { redirect?: string | null }
      }

      if (error.code === AuthErrorCode.PasswordRequired) {
        return { method: "password" } as const
      }

      if (error.code === AuthErrorCode.SsoRequired && error.links?.redirect) {
        return { method: "sso" } as const
      }

      throw new APIError(error)
    },
    gcTime: 0,
  })
}
