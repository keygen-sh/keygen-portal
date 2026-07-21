import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"
import { titleHead } from "@/lib/document-title"

export const Route = createFileRoute("/$accountId/auth/login")({
  head: titleHead("Sign in"),
  component: () => <Auth.Form.Login />,
})
