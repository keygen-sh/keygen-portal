import { createFileRoute } from "@tanstack/react-router"

import * as Page from "@/pages/index"

export const Route = createFileRoute("/_error/$")({
  component: () => <Page.Error.Generic />,
})
