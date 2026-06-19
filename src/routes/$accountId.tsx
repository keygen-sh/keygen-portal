import { createFileRoute } from "@tanstack/react-router"

import * as Layout from "@/layouts/index"
import * as keygen from "@/keygen"

export const Route = createFileRoute("/$accountId")({
  beforeLoad: ({ params }) => {
    keygen.config.setAccountId(params.accountId)
  },
  component: () => <Layout.Tenant />,
})
