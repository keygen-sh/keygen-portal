import { useGetProduct } from "@/queries/products"

import ResourceCell from "./resource-cell"

export default function ProductCell({ id }: { id: string | undefined }) {
  const { data, isLoading: productLoading } = useGetProduct(id)

  return (
    <ResourceCell isEmpty={!id || !data} isLoading={productLoading}>
      {data?.attributes.name}
    </ResourceCell>
  )
}
