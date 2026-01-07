import { humanize } from "@/lib/utils"
import { licenseAttributeTypeSchema } from "@/lib/licenses"

import { License } from "@/types/licenses"

import AttributeGroup from "@/components/licenses/attribute-group"

type Key = keyof typeof licenseAttributeTypeSchema

interface AllAttributesProps {
  license: License
  className?: string
}

export default function AllAttributes({
  license,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(licenseAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      license={license}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
