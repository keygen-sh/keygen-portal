import config from "@/keygen/config"
import client from "@/keygen/client"

import * as Schemas from "@/schemas"
import { PackageResponse } from "@/types/packages"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Packages.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<PackageResponse> {
  const body = {
    data: {
      type: "packages",
      attributes: values,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/packages/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as PackageResponse

  return result
}
