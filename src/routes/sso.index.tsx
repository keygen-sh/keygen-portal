import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/sso/")({
  beforeLoad: () => {
    notFound({ throw: true })
  },
  component: () => null,
})
