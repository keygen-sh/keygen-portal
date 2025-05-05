import { createFileRoute } from "@tanstack/react-router"
import * as Page from "@/pages/index"
import * as Guard from "@/guards/index"

export const Route = createFileRoute("/$id/auth/password")({
  component: () => {
    return (
      <Guard.RequireEmail>
        <Page.Auth.Password />
      </Guard.RequireEmail>
    )
  },
})
