import config from "@/keygen/config"
import client from "@/keygen/client"
import { ProductResponse, DistributionStrategy } from "@/types/products"

config.validate()

interface CreateProps {
  name: string
  code?: string | null
  distributionStrategy?: DistributionStrategy | null
  url?: string | null
  platforms?: string[] | null
  permissions?: string[] | null
  metadata?: Record<string, any> | null
}

export default async function create({
  name,
  code,
  distributionStrategy,
  url,
  platforms,
  permissions,
  metadata,
}: CreateProps): Promise<ProductResponse> {
  const body = {
    data: {
      type: "products",
      attributes: {
        name,
        ...(code && { code }),
        ...(distributionStrategy && { distributionStrategy }),
        ...(url && { url }),
        ...(platforms && { platforms }),
        ...(permissions && { permissions }),
        ...(metadata && { metadata }),
      },
    },
  }

  const result = (await client.request(`/accounts/${config.id}/products`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as ProductResponse

  return result
}
