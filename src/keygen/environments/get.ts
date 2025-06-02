import config from "@/keygen/config"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface GetProps {
  token: string
  id: string
}

export default async function get({
  token,
  id,
}: GetProps): Promise<EnvironmentResponse> {
  try {
    const response = await fetch(
      `https://${config.host}/v1/accounts/${config.id}/environments/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.api+json",
          "Keygen-Version": config.version,
        },
      },
    )

    const result = (await response.json()) as EnvironmentResponse

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    return result
  } catch (error) {
    console.error(
      "Get Environment Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return {
      errors: [
        {
          title: "Get Environment Error",
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
