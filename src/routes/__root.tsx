import { createRootRoute } from "@tanstack/react-router"
import "@/index.css"

import * as Layout from "@/layouts/index"

export const Route = createRootRoute({
  component: () => (
    <>
      <Layout.Root />
    </>
  ),
})
