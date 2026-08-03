import { useGetLicense } from "@/queries/licenses"

import EmptyCell from "./empty-cell"
import ResourceCell from "./resource-cell"

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
  const { data, isLoading: licenseLoading } = useGetLicense(id)

  return (
    <ResourceCell isEmpty={!data} isLoading={licenseLoading}>
      {data?.attributes.name || <EmptyCell />}
    </ResourceCell>
  )
}
