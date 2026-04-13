import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserResponse } from "@/types/users"

config.validate()

export default async function me(): Promise<UserResponse> {
  const result = (await client.request(`/accounts/${config.id}/me`, {
    method: "GET",
  })) as UserResponse

  return result
}
