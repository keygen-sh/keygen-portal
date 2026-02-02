import { useNavigate } from "@tanstack/react-router"

import { AnyResource } from "@/types/api"

import * as keygen from "@/keygen"

export function useResourceNavigate() {
  const navigate = useNavigate()

  return async (resource: AnyResource | null): Promise<void> => {
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
