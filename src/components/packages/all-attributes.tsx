import { humanize } from "@/lib/utils"
import { packageAttributeTypeSchema } from "@/lib/packages"
import { Package, PackageAttributeDescriptions } from "@/types/packages"
import * as Attribute from "@/components/attribute"
import CollapsibleCard from "@/components/collapsible-card"

type Key = keyof typeof packageAttributeTypeSchema

interface AllAttributesProps {
  pkg: Package
  className?: string
}

export default function AllAttributes({
  pkg,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(packageAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

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
          type={packageAttributeTypeSchema[k]}
          value={pkg.attributes[k] as string | number | boolean | null}
          tooltip={
            (PackageAttributeDescriptions as Record<Key, string | undefined>)[k]
          }
        />
      }
    />
  )

  return (
    <CollapsibleCard title="Attributes" contentClass={className}>
      <div className="md:grid md:grid-cols-2 md:gap-x-6 md:divide-x md:divide-dashed">
        <div className="space-y-4 md:pr-3">{left.map(row)}</div>
        <div className="mt-4 space-y-4 md:mt-0 md:pl-3">{right.map(row)}</div>
      </div>
    </CollapsibleCard>
  )
}
