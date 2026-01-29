import { useNavigate } from "@tanstack/react-router"

import { AnyResource, ResourceType } from "@/types/api"

import * as keygen from "@/keygen"

const ResourcePlurals: Record<ResourceType, string> = {
  component: "components",
  entitlement: "entitlements",
  group: "groups",
  license: "licenses",
  machine: "machines",
  policy: "policies",
  process: "processes",
  product: "products",
  user: "users",
}

export function useResourceNavigate() {
  const navigate = useNavigate()

  return async (
    resource: AnyResource | null,
    resourceType: ResourceType,
  ): Promise<void> => {
    if (!resource) return

    const plural = ResourcePlurals[resourceType]
    const param = `${resourceType}Id`

    return navigate({
      to: `/$id/app/${plural}/$${param}`,
      params: {
        id: keygen.config.id,
        [param]: resource.id,
      },
    })
  }
}
