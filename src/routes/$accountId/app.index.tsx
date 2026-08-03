import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$accountId/app/")({
  beforeLoad: ({ params }) => {
    redirect({
      to: "/$accountId/app/dashboard",
      params: { accountId: params.accountId },
      replace: true,
      throw: true,
    })
  },
  component: () => null,
})
