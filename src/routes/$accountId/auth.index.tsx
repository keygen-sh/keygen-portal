import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$accountId/auth/")({
  beforeLoad: ({ params, search }) => {
    redirect({
      to: "/$accountId/auth/login",
      params: { accountId: params.accountId },
      search,
      replace: true,
      throw: true,
    })
  },
  component: () => null,
})
