import config from "@/keygen/config"
import client from "@/keygen/client"

import { ReleaseResponse } from "@/types/releases"

config.validate()

interface ChangePackageProps {
  id: string
  packageId: string | null
}

export default async function changePackage({
  id,
  packageId,
}: ChangePackageProps): Promise<ReleaseResponse> {
  const body = {
    data: packageId ? { type: "packages", id: packageId } : null,
  }

  const result = (await client.request(
    `/accounts/${config.id}/releases/${id}/package`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  )) as ReleaseResponse

  return result
}
