import config from "@/keygen/config"
import client from "@/keygen/client"
import { ProductsListResponse } from "@/types/products"

config.validate()

interface ListProps {
  limit?: number
  pageNumber?: number
  pageSize?: number
}

export default async function list({
  limit,
  pageNumber,
  pageSize,
}: ListProps): Promise<ProductsListResponse> {
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

  const result = (await client.request(
    `/accounts/${config.id}/products?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ProductsListResponse

  return result
}
