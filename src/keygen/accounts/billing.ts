import config from "@/keygen/config"
import client from "@/keygen/client"
import { BillingResponse } from "@/types/billings"

config.validate()

export default async function billing(): Promise<BillingResponse> {
  const result = (await client.request(`/accounts/${config.id}/billing`, {
    method: "GET",
  })) as BillingResponse

  return result
}
