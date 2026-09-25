import type { MockContext } from "./context"
import type { MockResult } from "./types"

export type MockHandler = (ctx: MockContext) => MockResult | Promise<MockResult>

export interface MockRouteOptions {
  public?: boolean
}

interface Route {
  method: string
  segments: string[]
  handler: MockHandler
  options: MockRouteOptions
  staticCount: number
}

export interface MockMatch {
  handler: MockHandler
  params: Record<string, string>
  options: MockRouteOptions
}

const routes: Route[] = []

export const MOCK_ACCOUNT = "/v1/accounts/:account"
export const ANALYTICS = "/-/accounts/:account/analytics"

function splitPath(path: string): string[] {
  return path.split("/").filter((segment) => segment !== "")
}

export function mockRoute(
  method: string,
  pattern: string,
  handler: MockHandler,
  options: MockRouteOptions = {},
): void {
  const segments = splitPath(pattern)
  routes.push({
    method: method.toUpperCase(),
    segments,
    handler,
    options,
    staticCount: segments.filter((segment) => !segment.startsWith(":")).length,
  })
}

export function matchMockRoute(method: string, path: string): MockMatch | null {
  const segments = splitPath(path)
  let best: { route: Route; params: Record<string, string> } | null = null

  for (const candidate of routes) {
    if (candidate.method !== method.toUpperCase()) continue
    if (candidate.segments.length !== segments.length) continue

    const params: Record<string, string> = {}
    let matched = true

    for (let index = 0; index < segments.length; index++) {
      const expected = candidate.segments[index]
      const actual = segments[index]

      if (expected.startsWith(":")) {
        params[expected.slice(1)] = decodeURIComponent(actual)
      } else if (expected !== actual) {
        matched = false
        break
      }
    }

    if (!matched) continue
    if (!best || candidate.staticCount > best.route.staticCount) {
      best = { route: candidate, params }
    }
  }

  if (!best) return null
  return {
    handler: best.route.handler,
    params: best.params,
    options: best.route.options,
  }
}

export function hasMockRoutes(): boolean {
  return routes.length > 0
}
