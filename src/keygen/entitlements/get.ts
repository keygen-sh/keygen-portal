import config from "@/keygen/config"
import client from "@/keygen/client"
import { EntitlementResponse } from "@/types/entitlements"

config.validate()

interface GetProps {
  id: string
}

export default async function get({
  id,
}: GetProps): Promise<EntitlementResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/entitlements/${id}`,
    {
      method: "GET",
    },
  )) as EntitlementResponse

  return result
}
