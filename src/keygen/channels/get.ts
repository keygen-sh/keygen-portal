import config from "@/keygen/config"
import client from "@/keygen/client"
import { ChannelResponse } from "@/types/channels"

config.validate()

interface GetProps {
  id: string
}

export default async function get({ id }: GetProps): Promise<ChannelResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/channels/${id}`,
    {
      method: "GET",
    },
  )) as ChannelResponse

  return result
}
