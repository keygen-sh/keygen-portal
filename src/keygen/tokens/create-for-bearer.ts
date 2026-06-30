import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { compact } from "@/lib/compact"

import { TokenResponse, TokenBearerKind } from "@/types/tokens"

config.validate()

interface CreateForBearerProps {
  values: Schemas.Tokens.CreateValues
  bearerType: string
  environment?: string | null
  environmentToken?: string | null
}

export default async function createForBearer({
  values,
  bearerType,
  environment,
  environmentToken,
}: CreateForBearerProps): Promise<TokenResponse> {
  const isLicense = values.bearerKind === TokenBearerKind.License

  const body = {
    data: {
      type: "tokens",
      attributes: compact({
        name: values.name || undefined,
        expiry: isLicense ? values.expiry : undefined,
        maxActivations: isLicense ? values.maxActivations : undefined,
        maxDeactivations: isLicense ? values.maxDeactivations : undefined,
        permissions:
          !config.isCE && values.permissions?.length
            ? values.permissions
            : undefined,
      }),
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/${bearerType}/${values.bearerId}/tokens`,
    {
      method: "POST",
      body: JSON.stringify(body),
      ...(environment != null
        ? { environment, environmentToken }
        : { root: true }),
    },
  )) as TokenResponse

  return result
}
