import { createFileRoute } from "@tanstack/react-router"
import * as Auth from "@/components/auth"
import { titleHead } from "@/lib/document-title"

export const Route = createFileRoute("/auth/register")({
  head: titleHead("Create an account"),
  component: () => <Auth.Form.Register />,
})
