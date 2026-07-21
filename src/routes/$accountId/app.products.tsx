import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import { requirePermission } from "@/lib/permissions"
import { titleHead } from "@/lib/document-title"

export const Route = createFileRoute("/$accountId/app/products")({
  head: titleHead("Products"),
  component: () => <Page.App.Products />,
  beforeLoad: ({ context }) =>
    requirePermission(context.queryClient, "product.read"),
})
