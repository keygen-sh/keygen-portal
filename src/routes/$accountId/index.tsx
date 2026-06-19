import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$accountId/")({
  loader: ({ params }) => {
    return redirect({
      to: "/$accountId/app/dashboard",
      params: { accountId: params.accountId },
      replace: true,
    })
  },
  component: () => null,
})
