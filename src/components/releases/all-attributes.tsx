import { humanize } from "@/lib/utils"
import { releaseAttributeTypeSchema } from "@/lib/releases"
import { Release, ReleaseAttributeDescriptions } from "@/types/releases"
import * as Attribute from "@/components/attribute"
import CollapsibleCard from "@/components/collapsible-card"

type Key = keyof typeof releaseAttributeTypeSchema

interface AllAttributesProps {
  release: Release
  className?: string
}

// TODO(cazden) Refactor to allow including/excluding attributes like forms so we can compose our
// attributes section better, e.g. Semver attribute is rendering a full JSON variant which looks odd,
// so should be able to separate that from the other attributes for styling purposes
export default function AllAttributes({
  release,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(releaseAttributeTypeSchema) as Key[]).sort((a, b) =>
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
          type={releaseAttributeTypeSchema[k]}
          value={release.attributes[k] as string | number | boolean | null}
          tooltip={
            (ReleaseAttributeDescriptions as Record<Key, string | undefined>)[k]
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
