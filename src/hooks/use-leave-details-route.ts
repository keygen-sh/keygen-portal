import { useCallback } from "react"
import { useRouter } from "@tanstack/react-router"

export function useLeaveDetailsRoute(): () => Promise<void> {
  const router = useRouter()

  return useCallback(async () => {
    const { matches, location } = router.state
    const routeId = matches.at(-1)?.routeId

    if (routeId == null || !routeId.endsWith("/$id")) return

    await router.navigate({
      to: location.pathname.replace(/\/[^/]+$/, ""),
      replace: true,
    })
  }, [router])
}
