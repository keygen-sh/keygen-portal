import { Outlet, useParams } from "@tanstack/react-router"

import * as Motion from "@/components/motion"
import * as Page from "@/pages"

export default function Tokens() {
  const { id } = useParams({ strict: false })

  const view = id ? "details" : "list"
  const direction: 1 | -1 = view === "details" ? 1 : -1
  const key = view === "list" ? "list" : `details-${id}`

  return (
    <Motion.Slide direction={direction}>
      {view === "list" ? (
        <Page.App.Token.List key={key} />
      ) : (
        <Outlet key={key} />
      )}
    </Motion.Slide>
  )
}
