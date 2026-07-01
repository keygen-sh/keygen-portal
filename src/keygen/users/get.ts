import config from "@/keygen/config"
import client from "@/keygen/client"
import { UserResponse } from "@/types/users"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<UserResponse> {
  const result = (await client.request(`/accounts/${config.id}/users/${id}`, {
    method: "GET",
    root: client.currentUser === id,
  })) as UserResponse

  return result
}
