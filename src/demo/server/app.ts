import * as keygen from "@/keygen"

import { findMockAccount, findMockEnvironment, resolveMockBearer } from "./auth"
import type { MockContext } from "./context"
import {
  HttpError,
  badRequest,
  endpointNotFound,
  errors,
  notFound,
} from "./errors"
import { uuid } from "./ids"
import { recordMockRequest } from "./request-logs"
import { matchMockRoute } from "./router"
import type { MockResult } from "./types"

const MIN_LATENCY = 40
const MAX_LATENCY = 140
const CONTENT_TYPE = "application/vnd.api+json; charset=utf-8"

const originalFetch: typeof fetch = window.fetch.bind(window)

function sleep(millis: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, millis))
}

function parsePrefer(header: string | null): Set<string> {
  return new Set(
    (header ?? "")
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token !== ""),
  )
}

function readBody(init: RequestInit | undefined): string | null {
  const body = init?.body
  if (body == null) return null
  if (typeof body === "string") return body
  return null
}

function toResponse(result: MockResult, requestId: string): Response {
  if (result.status === 204 || result.body == null) {
    return new Response(null, {
      status: result.status,
      headers: result.headers,
    })
  }

  const body = { ...result.body }
  if ("errors" in body && result.status >= 400) {
    body.meta = {
      ...(body.meta as Record<string, unknown> | undefined),
      id: requestId,
    }
  }

  return new Response(JSON.stringify(body), {
    status: result.status,
    headers: { "Content-Type": CONTENT_TYPE, ...result.headers },
  })
}

function isMockedUrl(url: URL): boolean {
  return url.host === keygen.config.host
}

export async function handleMockRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const request = new Request(input, init)
  const url = new URL(request.url)

  if (!isMockedUrl(url)) {
    return originalFetch(input, init)
  }

  await sleep(MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY))

  const requestId = uuid()
  const rawBody = readBody(init)
  let body: unknown = null

  if (rawBody != null && rawBody !== "") {
    try {
      body = JSON.parse(rawBody) as unknown
    } catch {
      return toResponse(
        badRequest("The request body was not valid JSON"),
        requestId,
      )
    }
  }

  const path = url.pathname.replace(/\/+$/, "")
  const ctx: MockContext = {
    requestId,
    method: request.method.toUpperCase(),
    url,
    path,
    params: {},
    query: url.searchParams,
    body,
    headers: request.headers,
    prefer: parsePrefer(request.headers.get("prefer")),
    accountId: "",
    account: null,
    bearer: null,
    environment: null,
    resource: null,
  }

  const result = await dispatch(ctx)

  if (url.pathname.startsWith("/v1/")) {
    recordMockRequest(ctx, result, rawBody)
  }

  return toResponse(result, requestId)
}

async function dispatch(ctx: MockContext): Promise<MockResult> {
  const matched = matchMockRoute(ctx.method, ctx.path)
  if (!matched) return endpointNotFound()

  ctx.params = matched.params

  try {
    if (matched.params.account != null) {
      const account = findMockAccount(matched.params.account)
      if (!account) return notFound("account", matched.params.account)

      ctx.account = account
      ctx.accountId = account.id

      const environmentHeader = ctx.headers.get("keygen-environment")
      if (environmentHeader) {
        const environment = findMockEnvironment(account.id, environmentHeader)
        if (!environment) {
          return errors(400, {
            title: "Bad request",
            detail: "environment is invalid",
            code: "ENVIRONMENT_INVALID",
            source: { header: "Keygen-Environment" },
          })
        }
        ctx.environment = environment
      }
    }

    ctx.bearer = resolveMockBearer(ctx)

    if (!matched.options.public && !ctx.bearer) {
      return errors(401, {
        title: "Unauthorized",
        detail: "You must be authenticated to complete the request",
        code: "TOKEN_MISSING",
      })
    }

    return await matched.handler(ctx)
  } catch (error) {
    if (error instanceof HttpError) return error.result

    console.error(error)
    return errors(500, {
      title: "Internal server error",
      detail:
        error instanceof Error ? error.message : "Unexpected demo server error",
    })
  }
}
