import config from "@/keygen/config"
import client from "@/keygen/client"
import { PlanResponse } from "@/types/plans"

config.validate()

export default async function plan(id: string): Promise<PlanResponse> {
  const result = (await client.request(`/plans/${id}`, {
    method: "GET",
  })) as PlanResponse

  return result
}
