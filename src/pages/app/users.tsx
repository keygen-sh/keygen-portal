import { Outlet, useParams } from "@tanstack/react-router"

import { UserView } from "@/types/users"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Users() {
  const { userId } = useParams({ strict: false })

  const view = userId ? UserView.Details : UserView.List

  const direction: 1 | -1 = view === UserView.Details ? 1 : -1

  const key = view === UserView.List ? "list" : `details-${userId}`

  return (
    <Motion.Slide direction={direction}>
      {view === UserView.List ? (
        <Page.App.User.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
