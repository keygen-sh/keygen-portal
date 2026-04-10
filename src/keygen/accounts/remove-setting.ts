import config from "@/keygen/config"
import client from "@/keygen/client"

config.validate()

interface RemoveSettingProps {
  id: string
}

export default async function removeSetting({
  id,
}: RemoveSettingProps): Promise<null> {
  await client.request(`/accounts/${config.id}/settings/${id}`, {
    method: "DELETE",
  })

  return null
}
