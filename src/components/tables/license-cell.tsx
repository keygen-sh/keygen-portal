// TODO(cazden) Add licenses query
// import { useGetLicense } from "@/queries/licenses"

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
  // const { data, isLoading: licenseLoading } = useGetLicense(id)

  void id
  const data = { attributes: { name: "--" } }
  const licenseLoading = false

  return (
    <ResourceCell isEmpty={!data} isLoading={licenseLoading}>
      {data?.attributes.name}
    </ResourceCell>
  )
}
