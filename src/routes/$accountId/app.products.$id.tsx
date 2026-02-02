import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"

export const Route = createFileRoute("/$accountId/app/products/$id")({
  component: () => <Page.App.Product.Details />,
})
