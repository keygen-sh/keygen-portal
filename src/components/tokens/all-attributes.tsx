import { humanize } from "@/lib/utils"
import { tokenAttributeTypeSchema } from "@/lib/tokens"
import { Token } from "@/types/tokens"

import AttributeGroup from "@/components/tokens/attribute-group"

type Key = keyof typeof tokenAttributeTypeSchema

interface AllAttributesProps {
  token: Token
  className?: string
}

export default function AllAttributes({
  token,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(tokenAttributeTypeSchema) as Key[])
    .filter((key) => token.attributes[key] !== undefined)
    .sort((a, b) => humanize(a).localeCompare(humanize(b)))

  return (
    <AttributeGroup
      token={token}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
