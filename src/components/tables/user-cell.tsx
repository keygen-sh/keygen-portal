import { useGetUser } from "@/queries/users"

import { getUserLabel } from "@/lib/users"

import ResourceCell from "./resource-cell"

interface UserCellProps {
  id: string | undefined
}

export default function UserCell({ id }: UserCellProps): React.ReactElement {
  if (!id) return <ResourceCell isEmpty />
  return <UserCellContent id={id} />
}

function UserCellContent({ id }: { id: string }): React.ReactElement {
  const { data, isLoading: userLoading } = useGetUser(id)

  return (
    <ResourceCell isEmpty={!data} isLoading={userLoading}>
      {data && getUserLabel(data)}
    </ResourceCell>
  )
}
