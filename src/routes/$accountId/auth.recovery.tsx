import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"

export const Route = createFileRoute("/$accountId/auth/recovery")({
  component: () => <Auth.Form.Recovery />,
})
