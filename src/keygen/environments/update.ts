import config from "@/keygen/config"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface UpdateProps {
  token: string
  id: string
  name: string | null
  code: string | null
}

export default async function update({
  token,
  id,
  name,
  code,
}: UpdateProps): Promise<EnvironmentResponse> {
  try {
    const body = {
      data: {
        type: "environments",
        attributes: {
          ...(name && { name }),
          ...(code && { code }),
        },
      },
    }

    const response = await fetch(
      `https://${config.host}/v1/accounts/${config.id}/environments/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
          "Keygen-Version": config.version,
        },
        body: JSON.stringify(body),
      },
    )

    const result = (await response.json()) as EnvironmentResponse

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    return result
  } catch (error) {
    console.error(
      "Update Environment Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return {
      errors: [
        {
          title: "Update Environment Error",
          detail:
            error instanceof Error ? error.message : "Unknown error occurred",
          code: "CLIENT_ERROR",
          source: {},
          links: {},
        },
      ],
    }
  }
}
