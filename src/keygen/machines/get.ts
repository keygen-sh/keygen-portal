import config from "@/keygen/config"
import client from "@/keygen/client"
import { MachineResponse } from "@/types/machines"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<MachineResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/machines/${id}`,
    {
      method: "GET",
    },
  )) as MachineResponse

  return result
}
