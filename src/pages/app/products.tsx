import { Outlet, useParams } from "@tanstack/react-router"

import { ProductView } from "@/types/products"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Products() {
  const { productId } = useParams({ strict: false })

  const view = productId ? ProductView.Details : ProductView.List

  const direction: 1 | -1 = view === ProductView.Details ? 1 : -1

  const key = view === ProductView.List ? "list" : `details-${productId}`

  return (
    <Motion.Slide direction={direction}>
      {view === ProductView.List ? (
        <Page.App.Product.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
