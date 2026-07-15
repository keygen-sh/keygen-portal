import { useLocation, useNavigate } from "@tanstack/react-router"

import type { AnyResource } from "@/types/api"

import * as keygen from "@/keygen"

export type NavigableResource = Pick<AnyResource, "type" | "id">

export function useResourceNavigate() {
  const navigate = useNavigate()
  const location = useLocation()

  return async (resource: NavigableResource | null): Promise<void> => {
    if (!resource) return

    return navigate({
      to: `/$accountId/app/${resource.type}/$id`,
      params: {
        accountId: keygen.config.id,
        id: resource.id,
      },
      // save where we came from so the detail's breadcrumb can return to this
      // exact list with any filters applied, when it's the canonical parent
      state: (prev) => ({ ...prev, from: { pathname: location.pathname } }),
    })
  }
}
