import config from "@/keygen/config"
import client from "@/keygen/client"
import { MachineListResponse, type MachineFilters } from "@/types/machines"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
  filters?: MachineFilters
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
  filters,
}: ListProps): Promise<MachineListResponse> {
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
  if (filters?.status) {
    params.set("status", filters.status)
  }
  if (filters?.fingerprint) {
    params.set("fingerprint", filters.fingerprint)
  }
  if (filters?.ip) {
    params.set("ip", filters.ip)
  }
  if (filters?.hostname) {
    params.set("hostname", filters.hostname)
  }
  if (filters?.product) {
    params.set("product", filters.product)
  }
  if (filters?.policy) {
    params.set("policy", filters.policy)
  }
  if (filters?.license) {
    params.set("license", filters.license)
  }
  if (filters?.owner) {
    params.set("owner", filters.owner)
  }
  if (filters?.user) {
    params.set("user", filters.user)
  }
  if (filters?.group) {
    params.set("group", filters.group)
  }
  if (filters?.metadata) {
    for (const [key, value] of Object.entries(filters.metadata)) {
      params.set(`metadata[${key}]`, value)
    }
  }

  const result = (await client.request(
    `/accounts/${config.id}/machines?${params.toString()}`,
    {
      method: "GET",
    },
  )) as MachineListResponse

  return result
}
