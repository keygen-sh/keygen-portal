import config from "@/keygen/config"
import client from "@/keygen/client"

config.validate()

interface RemoveProps {
  id: string
}

export default async function remove({ id }: RemoveProps): Promise<null> {
  await client.request(`/accounts/${config.id}/environments/${id}`, {
    method: "DELETE",
    root: true,
  })

  return null
}
