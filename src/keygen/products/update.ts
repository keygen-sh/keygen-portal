import config from "@/keygen/config"
import client from "@/keygen/client"
import { ProductResponse, DistributionStrategy } from "@/types/products"

config.validate()

interface UpdateProps {
  id: string
  name?: string | null
  code?: string | null
  distributionStrategy?: DistributionStrategy | null
  url?: string | null
  platforms?: string[] | null
  permissions?: string[] | null
  metadata?: Record<string, string> | null
}

export default async function update({
  id,
  name,
  code,
  distributionStrategy,
  url,
  platforms,
  permissions,
  metadata,
}: UpdateProps): Promise<ProductResponse> {
  const body = {
    data: {
      type: "products",
      attributes: {
        ...(name && { name }),
        ...(code && { code }),
        ...(distributionStrategy && { distributionStrategy }),
        ...(url && { url }),
        ...(platforms && { platforms }),
        ...(permissions && { permissions }),
        ...(metadata && { metadata }),
      },
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/products/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as ProductResponse

  return result
}
