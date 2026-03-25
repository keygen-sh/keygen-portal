import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"
import { ArtifactResponse } from "@/types/artifacts"

config.validate()

export default async function create(
  values: Schemas.Artifacts.CreateValues,
): Promise<ArtifactResponse> {
  const { releaseId, ...attributes } = values

  const relationships: Record<string, unknown> = {
    release: {
      data: { type: "releases", id: releaseId },
    },
  }

  const body = {
    data: {
      type: "artifacts",
      attributes: compact(attributes),
      relationships,
    },
  }

  const result = (await client.request(`/accounts/${config.id}/artifacts`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Prefer: "no-redirect",
    },
  })) as ArtifactResponse

  return result
}
