import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"

import * as Forms from "@/forms"

config.validate()

interface UpdateProps {
  id: string
  values: Forms.Licenses.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<LicenseResponse> {
  const body = {
    data: {
      type: "licenses",
      attributes: values,
    },
  }

  const result = (await client.request(
    `/accounts/${config.id}/licenses/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  )) as LicenseResponse

  return result
}
