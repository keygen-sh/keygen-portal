import config from "@/keygen/config"
import client from "@/keygen/client"

import { ComponentResponse } from "@/types/components"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Components.CreateValues,
): Promise<ComponentResponse> {
  const { machineId, ...attributes } = values

  const relationships: Record<string, unknown> = {
    machine: {
      data: { type: "machines", id: machineId },
    },
  }

  const body = {
    data: {
      type: "components",
      attributes: compact(attributes),
      relationships,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/components`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as ComponentResponse

  return result
}
