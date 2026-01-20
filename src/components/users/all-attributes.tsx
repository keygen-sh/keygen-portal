import { humanize } from "@/lib/utils"
import { userAttributeTypeSchema } from "@/lib/users"

import { User } from "@/types/users"

import AttributeGroup from "@/components/users/attribute-group"

type Key = keyof typeof userAttributeTypeSchema

interface AllAttributesProps {
  user: User
  className?: string
}

export default function AllAttributes({
  user,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(userAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      user={user}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
