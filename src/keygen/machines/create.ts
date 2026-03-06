import config from "@/keygen/config"
import client from "@/keygen/client"

import { MachineResponse } from "@/types/machines"
import { compact } from "@/lib/compact"

import * as Schemas from "@/schemas"

config.validate()

export default async function create(
  values: Schemas.Machines.CreateValues,
): Promise<MachineResponse> {
  const { licenseId, groupId, ownerId, ...attributes } = values
  void ownerId
  void groupId

  const relationships: Record<string, unknown> = {
    license: {
      data: { type: "licenses", id: licenseId },
    },
  }

  const body = {
    data: {
      type: "machines",
      attributes: compact(attributes),
      relationships,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/machines`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as MachineResponse

  return result
}
