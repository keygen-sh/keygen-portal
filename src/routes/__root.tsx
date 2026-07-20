import { createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import "@/index.css"

import * as Layout from "@/layouts/index"
import * as Page from "@/pages/error"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Layout.Root />,
  notFoundComponent: () => <Page.NotFound />,
})
