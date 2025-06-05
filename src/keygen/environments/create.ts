import config from "@/keygen/config"
import client from "@/keygen/client"
import { EnvironmentResponse, IsolationStrategies } from "@/types/environments"

config.validate()

interface CreateProps {
  name: string
  code: string
  isolationStrategy: IsolationStrategies
}

export default async function create({
  name,
  code,
  isolationStrategy,
}: CreateProps): Promise<EnvironmentResponse> {
  const body = {
    data: {
      type: "environments",
      attributes: {
        name,
        code,
        isolationStrategy,
      },
    },
  }

  const result = (await client.request(`/accounts/${config.id}/environments`, {
    method: "POST",
    body: JSON.stringify(body),
  })) as EnvironmentResponse

  return result
}
