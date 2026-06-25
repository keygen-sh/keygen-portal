import { humanize } from "@/lib/utils"
import { entitlementAttributeTypeSchema } from "@/lib/entitlements"

import { Entitlement } from "@/types/entitlements"

import AttributeGroup from "@/components/entitlements/attribute-group"

type Key = keyof typeof entitlementAttributeTypeSchema

interface AllAttributesProps {
  entitlement: Entitlement
  className?: string
}

export default function AllAttributes({
  entitlement,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(entitlementAttributeTypeSchema) as Key[]).sort(
    (a, b) => humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      entitlement={entitlement}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
