import config from "@/keygen/config"
import client from "@/keygen/client"

import { MachineResponse } from "@/types/machines"
import { compact } from "@/lib/compact"

import * as Forms from "@/forms"

config.validate()

export default async function create(
  values: Forms.Machines.CreateValues,
): Promise<MachineResponse> {
  const { licenseId, groupId, ownerId, ...attributes } = values

  const relationships: Record<string, unknown> = {
    license: {
      data: { type: "licenses", id: licenseId },
    },
  }

  if (groupId) {
    relationships.group = {
      data: { type: "groups", id: groupId },
    }
  }

  if (ownerId) {
    relationships.owner = {
      data: { type: "users", id: ownerId },
    }
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
