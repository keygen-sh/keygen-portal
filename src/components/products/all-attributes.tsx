import { humanize } from "@/lib/utils"
import { productAttributeTypeSchema } from "@/lib/products"

import { Product } from "@/types/products"

import AttributeGroup from "@/components/products/attribute-group"

type Key = keyof typeof productAttributeTypeSchema

interface AllAttributesProps {
  product: Product
  className?: string
}

export default function AllAttributes({
  product,
  className,
}: AllAttributesProps): React.ReactElement {
  const keys = (Object.keys(productAttributeTypeSchema) as Key[]).sort((a, b) =>
    humanize(a).localeCompare(humanize(b)),
  )

  return (
    <AttributeGroup
      product={product}
      title="Attributes"
      keys={keys}
      className={className}
    />
  )
}
