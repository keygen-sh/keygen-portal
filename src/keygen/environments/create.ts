import config from "@/keygen/config"
import { EnvironmentResponse, IsolationStrategies } from "@/types/environments"

config.validate()

interface CreateProps {
  token: string
  name: string
  code: string
  isolationStrategy: IsolationStrategies
}

export default async function create({
  token,
  name,
  code,
  isolationStrategy,
}: CreateProps): Promise<EnvironmentResponse> {
  try {
    const body = {
      data: {
        type: "environments",
        attributes: {
          name,
          code,
          isolationStrategy,
        },
      },
    }

    const response = await fetch(
      `https://${config.host}/v1/accounts/${config.id}/environments`,
      {
        method: "POST",
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
      "Create Environment Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return {
      errors: [
        {
          title: "Create Environment Error",
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
