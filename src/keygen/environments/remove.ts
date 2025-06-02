import config from "@/keygen/config"
import { EnvironmentResponse } from "@/types/environments"

config.validate()

interface RemoveProps {
  token: string
  id: string
}

export default async function remove({
  token,
  id,
}: RemoveProps): Promise<EnvironmentResponse> {
  try {
    const response = await fetch(
      `https://${config.host}/v1/accounts/${config.id}/environments/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.api+json",
          "Keygen-Version": config.version,
        },
      },
    )

    if (!response.ok) {
      let result: EnvironmentResponse | undefined
      try {
        result = await response.json()
      } catch (e) {
        // Fallthrough if there's no JSON
      }

      throw new Error(`Request failed with status ${response.status}`)
    }

    return {}
  } catch (error) {
    console.error(
      "Delete Environment Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return {
      errors: [
        {
          title: "Delete Environment Error",
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
