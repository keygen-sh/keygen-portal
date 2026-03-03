import config from "@/keygen/config"
import client from "@/keygen/client"

import { LicenseResponse } from "@/types/licenses"

import * as Schemas from "@/schemas"

config.validate()

interface UpdateProps {
  id: string
  values: Schemas.Licenses.UpdateValues
}

export default async function update({
  id,
  values,
}: UpdateProps): Promise<LicenseResponse> {
  const { entitlements, users, ...attributes } = values
  void entitlements
  void users

  const body = {
    data: {
      type: "licenses",
      attributes,
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
