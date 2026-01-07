import { humanize } from "@/lib/utils"
import { licenseAttributeTypeSchema } from "@/lib/licenses"
import { License, LicenseAttributeDescriptions } from "@/types/licenses"
import * as Attribute from "@/components/attribute"
import CollapsibleCard from "@/components/collapsible-card"

type Key = keyof typeof licenseAttributeTypeSchema

type AttributeGroupProps = {
  license: License
  title: string
  keys: readonly Key[]
  when?: (license: License) => boolean
  className?: string
}

export default function AttributeGroup({
  license,
  title,
  keys,
  when,
  className,
}: AttributeGroupProps): React.ReactElement | null {
  if (when && !when(license)) return null
  if (keys.length === 0) return null

  const middle = Math.ceil(keys.length / 2)
  const left = keys.slice(0, middle)
  const right = keys.slice(middle)

  const row = (k: Key) => (
    <Attribute.Field
      key={k}
      label={humanize(k)}
      variant="none"
      value={
        <Attribute.Value
          type={licenseAttributeTypeSchema[k]}
          value={license.attributes[k]}
          tooltip={
            (LicenseAttributeDescriptions as Record<Key, string | undefined>)[k]
          }
        />
      }
    />
  )

  return (
    <CollapsibleCard title={title} contentClass={className}>
      <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
        <div className="space-y-4 md:pr-3">{left.map(row)}</div>
        <div className="mt-4 space-y-4 md:mt-0 md:pl-3">{right.map(row)}</div>
      </div>
    </CollapsibleCard>
  )
}
