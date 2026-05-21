import { useNavigate } from "@tanstack/react-router"

import type { AnyResource } from "@/types/api"

import * as keygen from "@/keygen"

export type NavigableResource = Pick<AnyResource, "type" | "id">

export function useResourceNavigate() {
  const navigate = useNavigate()

  return async (resource: NavigableResource | null): Promise<void> => {
    if (!resource) return

    return navigate({
      to: `/$accountId/app/${resource.type}/$id`,
      params: {
        accountId: keygen.config.id,
        id: resource.id,
      },
    })
  }
}
