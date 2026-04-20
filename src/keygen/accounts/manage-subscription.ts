import config from "@/keygen/config"
import client from "@/keygen/client"

import { APIResponse } from "@/types/api"

config.validate()

export type ManageSubscriptionResponse = APIResponse<null, { url: string }>

export default async function manageSubscription(): Promise<ManageSubscriptionResponse> {
  const result = (await client.request(
    `/accounts/${config.id}/actions/manage-subscription`,
    { method: "POST" },
  )) as ManageSubscriptionResponse

  return result
}
