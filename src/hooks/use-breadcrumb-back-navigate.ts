import { useLocation, useNavigate } from "@tanstack/react-router"

declare module "@tanstack/react-router" {
  interface HistoryState {
    from?: { pathname: string }
  }
}

export function useBreadcrumbBackNavigate(): (
  fallback?: () => void,
  listPath?: string,
) => void {
  const navigate = useNavigate()
  const location = useLocation()

  return async (fallback, listPath) => {
    const target = listPath ?? location.pathname.replace(/\/[^/]+$/, "")

    if (location.state.from?.pathname === target && window.history.length > 1) {
      window.history.back()

      return
    }

    if (fallback) {
      fallback()
    } else {
      await navigate({ to: ".." })
    }
  }
}
