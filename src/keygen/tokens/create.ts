import config from "@/keygen/config"
import client from "@/keygen/client"

import { Linkage } from "@/types/api"
import { TokenResponse, TokenBearerKind } from "@/types/tokens"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"

config.validate()

interface CreateProps {
  values?: Schemas.Tokens.CreateValues
  relationships?: { environment?: { data: Linkage<"environments"> } }
}

export default async function create({
  values,
  relationships,
}: CreateProps): Promise<TokenResponse> {
  const isLicense = values?.bearerKind === TokenBearerKind.License

  const body = {
    data: {
      type: "tokens",
      ...(values != null
        ? {
            attributes: compact({
              name: values.name || undefined,
              expiry: values.expiry,
              maxActivations: isLicense ? values.maxActivations : undefined,
              maxDeactivations: isLicense ? values.maxDeactivations : undefined,
              permissions:
                !config.isCE && values.permissions?.length
                  ? values.permissions
                  : undefined,
            }),
          }
        : {}),
      ...(relationships != null ? { relationships } : {}),
    },
  }

  const result = (await client.request(`/accounts/${config.id}/tokens`, {
    method: "POST",
    root: true,
    body: JSON.stringify(body),
  })) as TokenResponse

  return result
}
