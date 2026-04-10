import config from "@/keygen/config"
import client from "@/keygen/client"
import { AccountResponse } from "@/types/accounts"

config.validate()

export default async function get(): Promise<AccountResponse> {
  const result = (await client.request(`/accounts/${config.id}`, {
    method: "GET",
  })) as AccountResponse

  return result
}
