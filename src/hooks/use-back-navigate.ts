import { useEffect } from "react"
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router"

export const useBackNavigate = (): (() => Promise<void>) => {
  const navigate = useNavigate()

  return async () => {
    if (window.history.length > 1) {
      window.history.back()

      return
    }

    await navigate({ to: ".." })
  }
}

// navigate a resource details route back to its list, e.g.
// a license that is out of scope after switching environments
export function useBackNavigateIfDetailsRoute(): boolean {
  const router = useRouter()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { routeParams } = router.getMatchedRoutes(pathname)

  // NB(cazden) from a 404, ".." lands on /$accountId/app instead of list
  // so we need to manually create the list path from the current pathname
  const listPath = routeParams.id ? pathname.replace(/\/[^/]+$/, "") : null

  useEffect(() => {
    if (listPath == null) return

    void navigate({ to: listPath, replace: true })
  }, [listPath, navigate])

  return listPath != null
}
