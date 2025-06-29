import { Outlet, useParams } from "@tanstack/react-router"

import { ProductView } from "@/types/products"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Products() {
  const { productId } = useParams({ strict: false })

  const view = productId ? ProductView.DETAILS : ProductView.LIST

  const direction: 1 | -1 = view === ProductView.DETAILS ? 1 : -1

  const key = view === ProductView.LIST ? "list" : `details-${productId}`

  return (
    <Motion.Slide direction={direction}>
      {view === ProductView.LIST ? (
        <Page.App.Product.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
