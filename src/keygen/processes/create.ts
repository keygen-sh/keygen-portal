import config from "@/keygen/config"
import client from "@/keygen/client"

import { ProcessResponse } from "@/types/processes"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Processes.CreateValues,
): Promise<ProcessResponse> {
  const { machineId, ...attributes } = values

  const relationships: Record<string, unknown> = {
    machine: {
      data: { type: "machines", id: machineId },
    },
  }

  const body = {
    data: {
      type: "processes",
      attributes: compact(attributes),
      relationships,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/processes`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as ProcessResponse

  return result
}
