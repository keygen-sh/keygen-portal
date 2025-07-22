import config from "@/keygen/config"
import client from "@/keygen/client"
import { ProductResponse } from "@/types/products"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<ProductResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/products/${id}`,
    {
      method: "GET",
    },
  )) as ProductResponse

  return result
}
