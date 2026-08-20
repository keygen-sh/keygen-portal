import config from "@/keygen/config"

import { APIError } from "@/types/api"
import { LicenseValidationResponse } from "@/types/licenses"

config.validate()

interface ValidateKeyProps {
  key: string
  environment?: string | null
  signal?: AbortSignal
}

export default async function validateKey({
  key,
  environment,
  signal,
}: ValidateKeyProps): Promise<LicenseValidationResponse> {
  const response = await fetch(
    `https://${config.host}/v1/accounts/${config.id}/licenses/actions/validate-key`,
    {
      method: "POST",
      credentials: "omit",
      signal,
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Keygen-Version": config.version,
        ...(environment ? { "Keygen-Environment": environment } : {}),
      },
      body: JSON.stringify({ meta: { key } }),
    },
  )

  const result = (await response
    .json()
    .catch(() => null)) as LicenseValidationResponse | null

  if (result == null) {
    return {
      errors: [
        new APIError({
          title: "Validation failed",
          detail: `The API responded with ${response.status}.`,
        }),
      ],
    }
  }

  return result
}
