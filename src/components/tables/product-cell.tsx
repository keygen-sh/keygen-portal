import { useGetProduct } from "@/queries/products"

import ResourceCell from "./resource-cell"

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
  const { data, isLoading: productLoading } = useGetProduct(id)

  return (
    <ResourceCell isEmpty={!data} isLoading={productLoading}>
      {data?.attributes.name}
    </ResourceCell>
  )
}
