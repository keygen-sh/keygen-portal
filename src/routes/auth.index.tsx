import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"

export const Route = createFileRoute("/auth/")({
  component: () => <Auth.Form.Account />,
})
