import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"

export const Route = createFileRoute("/$accountId/app/products")({
  component: () => <Page.App.Products />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "product.read"),
})
