import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import * as Guard from "@/guards/index"

export const Route = createFileRoute("/$accountId/auth/sso")({
  component: () => {
    return (
      <Guard.RequireSsoRedirect>
        <Page.Auth.Sso />
      </Guard.RequireSsoRedirect>
    )
  },
})
