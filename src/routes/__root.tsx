import { createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import "@/index.css"

import * as Layout from "@/layouts/index"

export const Route = createRootRoute({
  component: () => (
    <>
      <Layout.Root />
      <TanStackRouterDevtools />
    </>
  ),
})
