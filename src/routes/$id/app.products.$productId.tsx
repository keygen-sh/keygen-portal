import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$id/app/products/$productId")({
  component: () => <Page.App.Product.Details />,
})
