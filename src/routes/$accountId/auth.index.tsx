import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$accountId/auth/")({
  beforeLoad: ({ params }) => {
    redirect({
      to: "/$accountId/auth/login",
      params: { accountId: params.accountId },
      replace: true,
      throw: true,
    })
  },
  component: () => null,
})
