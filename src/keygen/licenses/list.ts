import config from "@/keygen/config"
import client from "@/keygen/client"
import { LicenseListResponse } from "@/types/licenses"

config.validate()

interface ListFilters {
  status?: string
  expires?: Record<string, string>
  expired?: Record<string, string>
  activity?: Record<string, string>
  unassigned?: boolean
  assigned?: boolean
  activated?: boolean
  activations?: Record<string, number>
  product?: string
  policy?: string
  owner?: string
  user?: string
  group?: string
  machine?: string
  metadata?: Record<string, string>
}

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  filters?: ListFilters
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  filters,
}: ListProps): Promise<LicenseListResponse> {
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
  if (filters != null) {
    if (filters.status) {
      params.set("status", filters.status)
    }
    if (filters.expires) {
      for (const [op, value] of Object.entries(filters.expires)) {
        params.set(`expires[${op}]`, value)
      }
    }
    if (filters.expired) {
      for (const [op, value] of Object.entries(filters.expired)) {
        params.set(`expired[${op}]`, value)
      }
    }
    if (filters.activity) {
      for (const [op, value] of Object.entries(filters.activity)) {
        params.set(`activity[${op}]`, value)
      }
    }
    if (filters.unassigned != null) {
      params.set("unassigned", filters.unassigned.toString())
    }
    if (filters.assigned != null) {
      params.set("assigned", filters.assigned.toString())
    }
    if (filters.activated != null) {
      params.set("activated", filters.activated.toString())
    }
    if (filters.activations) {
      for (const [op, value] of Object.entries(filters.activations)) {
        params.set(`activations[${op}]`, value.toString())
      }
    }
    if (filters.product) {
      params.set("product", filters.product)
    }
    if (filters.policy) {
      params.set("policy", filters.policy)
    }
    if (filters.owner) {
      params.set("owner", filters.owner)
    }
    if (filters.user) {
      params.set("user", filters.user)
    }
    if (filters.group) {
      params.set("group", filters.group)
    }
    if (filters.machine) {
      params.set("machine", filters.machine)
    }
    if (filters.metadata) {
      for (const [key, value] of Object.entries(filters.metadata)) {
        params.set(`metadata[${key}]`, value)
      }
    }
  }

  const result = (await client.request(
    `/accounts/${config.id}/licenses?${params.toString()}`,
    {
      method: "GET",
    },
  )) as LicenseListResponse

  return result
}
