import { useGetProduct } from "@/queries/products"

import * as keygen from "@/keygen"

import ResourceCell from "./resource-cell"
import GoToButton from "@/components/go-to-button"

interface ProductCellProps {
  id: string | undefined
}

export default function ProductCell({
  id,
}: ProductCellProps): React.ReactElement {
  if (!id) return <ResourceCell isEmpty />
  return <ProductCellContent id={id} />
}

function ProductCellContent({ id }: { id: string }): React.ReactElement {
  const { data: product, isLoading: productLoading } = useGetProduct(id)

  const label = product?.attributes.name || "View Product"

  return (
    <ResourceCell isEmpty={!product} isLoading={productLoading}>
      <GoToButton
        path="/$id/app/products/$productId"
        params={{ id: keygen.config.id, productId: id }}
        label={label}
      />
    </ResourceCell>
  )
}
