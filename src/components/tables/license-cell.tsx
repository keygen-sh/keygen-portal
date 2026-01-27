import { useGetLicense } from "@/queries/licenses"

import * as keygen from "@/keygen"

import ResourceCell from "./resource-cell"
import GoToButton from "@/components/go-to-button"

interface LicenseCellProps {
  id: string | undefined
}

export default function LicenseCell({
  id,
}: LicenseCellProps): React.ReactElement {
  if (!id) return <ResourceCell isEmpty />
  return <LicenseCellContent id={id} />
}

function LicenseCellContent({ id }: { id: string }): React.ReactElement {
  const { data: license, isLoading: licenseLoading } = useGetLicense(id)

  const label = license?.attributes.name || id.slice(0, 8)

  return (
    <ResourceCell isEmpty={!license} isLoading={licenseLoading}>
      <GoToButton
        path="/$id/app/licenses/$licenseId"
        params={{ id: keygen.config.id, licenseId: id }}
        label={label}
      />
    </ResourceCell>
  )
}
