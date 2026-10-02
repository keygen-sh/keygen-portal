import { useContext, useState } from "react"
import {
  CatchNotFound,
  Outlet,
  getRouterContext,
  matchContext,
  notFound,
  useRouter,
  type AnyRouter,
} from "@tanstack/react-router"

const RouterContext = getRouterContext()

function childMatchId(state: AnyRouter["state"], parentMatchId?: string) {
  const index = state.matches.findIndex((match) => match.id === parentMatchId)
  return state.matches[index + 1]?.id
}

function isMatchLive(state: AnyRouter["state"], matchId?: string) {
  return !state.isLoading && state.matches.some((match) => match.id === matchId)
}

function holdRouter(router: AnyRouter, matchId?: string) {
  const store = router.__store
  let held = store.state

  return Object.create(router, {
    __store: {
      value: {
        get state() {
          if (isMatchLive(store.state, matchId)) held = store.state
          return held
        },
        subscribe: store.subscribe,
      },
    },
  }) as AnyRouter
}

// when a route is removed, an <Outlet /> will render nothing (i.e. details > list pages),
// so we hold the last router state so the page can finish animating out
export default function MotionOutlet() {
  const router = useRouter()
  const parentMatchId = useContext(matchContext)
  const [matchId] = useState(() => childMatchId(router.state, parentMatchId))
  const [heldRouter] = useState(() => holdRouter(router, matchId))

  return (
    <RouterContext.Provider value={heldRouter}>
      <CatchNotFound
        fallback={(error) => {
          if (isMatchLive(router.state, matchId))
            notFound({ ...error, throw: true })
          return <></>
        }}
      >
        <Outlet />
      </CatchNotFound>
    </RouterContext.Provider>
  )
}
