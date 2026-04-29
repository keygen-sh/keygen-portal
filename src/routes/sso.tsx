import { createFileRoute } from "@tanstack/react-router"
import * as Layout from "@/layouts/index"

export const Route = createFileRoute("/sso")({
  // FIXME(cazden) Misleading to have `sso` render an error layout, but `sso.error`
  //               is our only nested route at the moment, so leaving as-is for now.
  component: () => <Layout.Error />,
})
