import config from "@/keygen/config"
import { EnvironmentsListResponse } from "@/types/environments"

config.validate()

interface ListProps {
  token: string
  limit?: number
  pageNumber?: number
  pageSize?: number
}

export default async function list({
  token,
  limit,
  pageNumber,
  pageSize,
}: ListProps): Promise<EnvironmentsListResponse> {
  try {
    const params = new URLSearchParams()
    if (limit != null) {
      params.set("limit", limit.toString())
    }
    if (pageNumber != null) {
      params.set("page[number]", pageNumber.toString())
    }
    if (pageSize != null) {
      params.set("page[size]", pageSize.toString())
    }

    const response = await fetch(
      `https://${config.host}/v1/accounts/${config.id}/environments?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.api+json",
          "Keygen-Version": config.version,
        },
      },
    )

    const result = (await response.json()) as EnvironmentsListResponse

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    return result
  } catch (error) {
    console.error(
      "List Environments Error:",
      error instanceof Error ? error.message : "Unknown error occurred",
    )

    return {
      errors: [
        {
          title: "List Environments Error",
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
