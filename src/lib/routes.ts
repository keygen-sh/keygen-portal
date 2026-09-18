import { linkOptions } from "@tanstack/react-router"

import type { FileRouteTypes } from "@/routeTree.gen"
import { Route as AppRoute } from "@/routes/$accountId/app"

type AppRoutePath = Extract<
  FileRouteTypes["to"],
  "/$accountId/app" | `/$accountId/app/${string}`
>

interface RouteNode {
  fullPath: string
  children?: RouteNode[]
}

function collectFullPaths(route: RouteNode): string[] {
  return [route.fullPath, ...(route.children ?? []).flatMap(collectFullPaths)]
}

function isAppRoutePath(path: string): path is AppRoutePath {
  return collectFullPaths(AppRoute as RouteNode).includes(path)
}

export function staticLinkTarget(splat: string, accountId: string) {
  const [resource = "", id, ...rest] = splat.split("/")
  if (rest.length > 0) return null

  const to = id
    ? `/$accountId/app/${resource}/$id`
    : resource
      ? `/$accountId/app/${resource}`
      : "/$accountId/app"
  if (!isAppRoutePath(to)) return null

  return linkOptions({ to, params: { accountId, id } })
}
