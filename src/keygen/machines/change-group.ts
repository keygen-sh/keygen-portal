import config from "@/keygen/config"
import client from "@/keygen/client"

import { MachineResponse } from "@/types/machines"

config.validate()

interface ChangeGroupProps {
  id: string
  groupId: string | null
}

export default async function changeGroup({
  id,
  groupId,
}: ChangeGroupProps): Promise<MachineResponse> {
  const body = {
    data: groupId ? { type: "groups", id: groupId } : null,
  }

  const result = (await client.request(
    `/accounts/${config.id}/machines/${id}/group`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  )) as MachineResponse

  return result
}
