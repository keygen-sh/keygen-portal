import config from "@/keygen/config"
import client from "@/keygen/client"
import { ProductsListResponse } from "@/types/products"

config.validate()

interface ListProductsProps {
  userId: string
  limit?: number
  pageCursor?: string | null
  pageSize?: number
}

export default async function listProducts({
  userId,
  limit,
  pageCursor,
  pageSize,
}: ListProductsProps): Promise<ProductsListResponse> {
  const params = new URLSearchParams()
  if (limit != null) {
    params.set("limit", limit.toString())
  }
  if (pageSize != null) {
    params.set("page[size]", pageSize.toString())
    params.set("page[cursor]", pageCursor ?? "")
  }

  const result = (await client.request(
    `/accounts/${config.id}/users/${userId}/products?${params.toString()}`,
    {
      method: "GET",
    },
  )) as ProductsListResponse

  return result
}
