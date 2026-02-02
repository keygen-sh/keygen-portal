import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import * as Guard from "@/guards/index"

export const Route = createFileRoute("/$accountId/auth/verify")({
  component: () => {
    return (
      <Guard.RequirePassword>
        <Page.Auth.Verify />
      </Guard.RequirePassword>
    )
  },
})
